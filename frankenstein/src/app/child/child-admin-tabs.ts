import { APP_INITIALIZER, Provider } from '@angular/core';
import { AdminTabsRegistryService, AdminTabDef } from '../core/services/admin-tabs-registry.service';

// Ajoutez ici les onglets admin spécifiques à ce child.
// Ce fichier n'est jamais écrasé par les propagations de la base.
// Exemple :
// import { AdminProjetsComponent } from './pages/admin-projets/admin-projets.component';
// const tabs: AdminTabDef[] = [
//   { id: 'projets', label: 'Projets', icon: 'folder', component: AdminProjetsComponent, order: 10 },
// ];

const CHILD_ADMIN_TABS: AdminTabDef[] = [];

export const CHILD_ADMIN_TABS_PROVIDERS: Provider[] = [
  {
    provide: APP_INITIALIZER,
    useFactory: (registry: AdminTabsRegistryService) => () => {
      registry.registerChild(CHILD_ADMIN_TABS);
    },
    deps: [AdminTabsRegistryService],
    multi: true
  }
];
