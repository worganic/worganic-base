import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WoActionHistoryService, WoActionEntry } from '../../../core/services/wo-action-history.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-wo-action-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wo-action-history.component.html',
  styleUrl: './wo-action-history.component.scss'
})
export class WoActionHistoryComponent implements OnInit {
  private historyService = inject(WoActionHistoryService);
  private auth = inject(AuthService);

  loading = signal(false);
  undoing = signal<string | null>(null);
  error = signal('');

  filterSectionValue = '';
  filterUserIdValue = '';
  filterActionTypeValue = '';

  get isAdmin() { return this.auth.currentUser()?.role === 'admin'; }

  get availableSections(): string[] {
    const sections = new Set(this.historyService.entries().map(e => e.section));
    return Array.from(sections).sort();
  }

  get availableUsers(): { id: string; name: string }[] {
    const users = new Map<string, string>();
    this.historyService.entries().forEach(e => {
      if (e.userId && e.username) users.set(e.userId, e.username);
    });
    return Array.from(users.entries()).map(([id, name]) => ({ id, name }));
  }

  get filteredEntries(): WoActionEntry[] {
    let list = this.historyService.entries();
    if (this.filterSectionValue) list = list.filter(e => e.section === this.filterSectionValue);
    if (this.filterUserIdValue) list = list.filter(e => e.userId === this.filterUserIdValue);
    if (this.filterActionTypeValue) list = list.filter(e => e.actionType === this.filterActionTypeValue);
    return list;
  }

  get groupedEntries(): { day: string; entries: WoActionEntry[] }[] {
    const groups = new Map<string, WoActionEntry[]>();
    for (const entry of this.filteredEntries) {
      const day = new Date(entry.timestamp).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
      if (!groups.has(day)) groups.set(day, []);
      groups.get(day)!.push(entry);
    }
    return Array.from(groups.entries()).map(([day, entries]) => ({ day, entries }));
  }

  get undoableCount(): number {
    return this.filteredEntries.filter(e => e.undoable && !e.undone).length;
  }

  async ngOnInit() {
    await this.loadHistory();
  }

  async loadHistory() {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.historyService.load({ limit: 300 });
    } catch {
      this.error.set("Erreur lors du chargement de l'historique");
    } finally {
      this.loading.set(false);
    }
  }

  async undoAction(entry: WoActionEntry) {
    if (!entry.undoable || entry.undone || this.undoing()) return;
    this.undoing.set(entry.id);
    this.error.set('');
    try {
      await this.historyService.undo(entry.id);
    } catch (e: any) {
      this.error.set(e?.error?.error || "Erreur lors de l'annulation");
    } finally {
      this.undoing.set(null);
    }
  }

  actionTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      create: 'Création', update: 'Modification', delete: 'Suppression',
      toggle: 'Activation', upload: 'Import', navigate: 'Navigation'
    };
    return labels[type] || type;
  }

  actionTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      create: 'add_circle', update: 'edit', delete: 'delete',
      toggle: 'toggle_on', upload: 'upload_file', navigate: 'navigation'
    };
    return icons[type] || 'history';
  }

  actionTypeColor(type: string): string {
    const colors: Record<string, string> = {
      create: 'text-emerald-400',
      update: 'text-blue-400',
      delete: 'text-red-400',
      toggle: 'text-violet-400',
      upload: 'text-amber-400',
      navigate: 'text-gray-400'
    };
    return colors[type] || 'text-gray-400';
  }

  actionTypeBgBorder(type: string): string {
    const colors: Record<string, string> = {
      create: 'bg-emerald-500/10 border-emerald-500/20',
      update: 'bg-blue-500/10 border-blue-500/20',
      delete: 'bg-red-500/10 border-red-500/20',
      toggle: 'bg-violet-500/10 border-violet-500/20',
      upload: 'bg-amber-500/10 border-amber-500/20',
      navigate: 'bg-gray-500/10 border-gray-500/20'
    };
    return colors[type] || 'bg-gray-500/10 border-gray-500/20';
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  formatContextLabel(context: Record<string, any> | undefined): string {
    if (!context) return '';
    if (context['projectName']) return `Projet : ${context['projectName']}`;
    if (context['categoryName']) return `Catégorie : ${context['categoryName']}`;
    return '';
  }

  sectionLabel(section: string): string {
    const labels: Record<string, string> = {
      'admin/users': 'Admin › Utilisateurs',
      'admin/config': 'Admin › Config',
      'documents': 'Documents',
      'projets': 'Projets'
    };
    return labels[section] || section;
  }
}
