/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // ── Règles universelles ────────────────────────────────────────────────
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Les dépendances circulaires rendent le code difficile à maintenir',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'Fichiers non importés nulle part — probablement du code mort',
      from: {
        orphan: true,
        pathNot: [
          '\\.spec\\.ts$',
          '\\.d\\.ts$',
          'main\\.ts$',
          // Migrations et data-source sont des points d'entrée autonomes
          'database/migrations/',
          'data-source\\.ts$',
          // Interfaces et abstractions du shared kernel légitimement non importées
          '_shared/',
          // Read models utilisés dans les handlers mais non importés directement
          'domain/models/',
          // Critères utilisés uniquement dans les finders (injection future)
          'domain/criteria/',
        ],
      },
      to: {},
    },

    // ── Isolation de la couche Domain (module spécifique uniquement) ───────
    // _shared/infrastructure est le kernel CQRS partagé — autorisé partout
    {
      name: 'domain-no-module-infrastructure',
      severity: 'error',
      comment: 'La couche domain ne doit pas dépendre de l\'infrastructure d\'un module métier',
      from: { path: '^src/(?!_shared)[^/]+/domain/' },
      to: {
        path: '^src/(?!_shared)[^/]+/infrastructure/',
        pathNot: '^src/_shared/',
      },
    },
    {
      name: 'domain-no-application',
      severity: 'error',
      comment: 'La couche domain ne doit pas dépendre de application',
      from: { path: '^src/(?!_shared)[^/]+/domain/' },
      to: { path: '^src/(?!_shared)[^/]+/application/' },
    },
    {
      name: 'domain-no-presentation',
      severity: 'error',
      comment: 'La couche domain ne doit pas dépendre de presentation',
      from: { path: '^src/(?!_shared)[^/]+/domain/' },
      to: { path: '^src/(?!_shared)[^/]+/presentation/' },
    },

    // ── Isolation de la couche Application ────────────────────────────────
    {
      name: 'application-no-presentation',
      severity: 'error',
      comment: 'La couche application ne doit pas dépendre de presentation',
      from: { path: '^src/(?!_shared)[^/]+/application/' },
      to: { path: '^src/(?!_shared)[^/]+/presentation/' },
    },
    {
      name: 'application-no-module-infrastructure',
      severity: 'error',
      comment: 'La couche application ne doit pas dépendre de l\'infrastructure d\'un module métier',
      from: { path: '^src/(?!_shared)[^/]+/application/' },
      to: {
        path: '^src/(?!_shared)[^/]+/infrastructure/',
        pathNot: '^src/_shared/',
      },
    },

    // ── Isolation de la couche Infrastructure ─────────────────────────────
    {
      name: 'infrastructure-no-presentation',
      severity: 'error',
      comment: 'La couche infrastructure ne doit pas dépendre de presentation',
      from: { path: '^src/(?!_shared)[^/]+/infrastructure/' },
      to: { path: '^src/(?!_shared)[^/]+/presentation/' },
    },
  ],

  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    exclude: {
      path: ['\\.spec\\.ts$', 'node_modules'],
    },
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
  },
};
