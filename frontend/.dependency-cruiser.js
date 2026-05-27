/* eslint-disable */
/**
 * Dependency Cruiser configuration.
 *
 * Architecture rationale:
 *
 * The codebase is organized as an Nx monorepo with one app (`apps/intapp-suite`)
 * and four libs sitting in a strict dependency ladder:
 *
 *   util  <-  i18n  <-  auth  <-  termsheet  <-  app
 *
 * Each arrow means "is consumed by". A lib NEVER reaches up the ladder. This
 * avoids the cycles that emerge in flat workspaces where any lib can pull from
 * any other.
 *
 * Duplicated domain entities are accepted by design. If both `auth` and
 * `termsheet` need a notion of "User" with slightly different shape, each
 * defines its own model rather than sharing a single one through cross-imports.
 * The cost of duplication is much smaller than the cost of accidental cycles
 * or context bleed.
 *
 * The single non-negotiable rule below is `no-circular`. Everything else is
 * scaffolding to make breakage of the ladder hard to do by accident.
 *
 * @type {import('dependency-cruiser').IConfiguration}
 */
module.exports = {
  forbidden: [
    {
      name: 'lib-util-leaf',
      comment:
        'libs/util is the leaf of the dependency graph. It must not import from any other ' +
        'internal lib (i18n, auth, termsheet, etc) — only from external packages. This keeps util ' +
        'consumable by everyone without dragging context-specific code along.',
      severity: 'error',
      from: { path: '^libs/util' },
      to: { path: '^libs/(?!util)', pathNot: '^node_modules' },
    },
    {
      name: 'lib-i18n-only-util',
      comment:
        'libs/i18n provides translation infrastructure used by every other lib. To stay ' +
        'reusable it can only depend on libs/util (e.g. BrowserStorageService) and external ' +
        'packages — never auth, termsheet, or app code.',
      severity: 'error',
      from: { path: '^libs/i18n' },
      to: { path: '^libs/(?!i18n|util)', pathNot: '^node_modules' },
    },
    {
      name: 'lib-auth-only-util-i18n',
      comment:
        'libs/auth implements authentication and is consumed by termsheet/app. It can rely on ' +
        'util (storage/http helpers) and i18n (translated error messages), but must not import ' +
        'from termsheet or other product libs — that would invert the ladder and create cycles.',
      severity: 'error',
      from: { path: '^libs/auth' },
      to: { path: '^libs/(?!auth|util|i18n)', pathNot: '^node_modules' },
    },
    {
      name: 'lib-termsheet-no-app',
      comment:
        'libs/termsheet is product code consumed by the app. It may freely import from util, ' +
        'i18n and auth (everything below it on the ladder), but must never reach into apps/* ' +
        '— libs are infrastructure for apps, not the other way around.',
      severity: 'error',
      from: { path: '^libs/termsheet' },
      to: { path: '^apps/' },
    },
    {
      name: 'libs-cannot-import-from-app',
      comment:
        'Defensive rule covering all libs: no lib should ever import from apps/. This is what ' +
        'keeps libs reusable across multiple host apps in the future.',
      severity: 'error',
      from: { path: '^libs/' },
      to: { path: '^apps/' },
    },
    {
      name: 'modules-cannot-import-features',
      comment:
        'Within a lib, modules/ is the stable inner layer (services, stores, models, ports). ' +
        'features/ is the outer UI/routing layer that USES modules. Allowing features/ to be ' +
        'imported from modules/ would invert the layering and pull UI concerns into the domain ' +
        "core. The $1 backreference scopes the rule per-lib so cross-lib doesn't accidentally " +
        'match here (cross-lib direction is already enforced by the ladder rules above).',
      severity: 'error',
      from: { path: '^libs/([^/]+)/src/lib/modules' },
      to: { path: '^libs/$1/src/lib/features' },
    },
    {
      name: 'no-circular',
      comment:
        'No circular dependencies anywhere. This is the load-bearing guarantee of the codebase: ' +
        'all the ladder rules above can technically be loosened, but a cycle always indicates a ' +
        'structural problem (commonly a service reaching back into a feature, or two domain ' +
        'modules cross-importing instead of sharing an extracted abstraction). Fix by inverting ' +
        'a dependency, splitting the shared piece into a lower lib (e.g. util), or duplicating ' +
        'the entity intentionally per context.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'not-to-spec',
      comment:
        'Production code must not import from *.spec.ts / *.test.ts. Specs are private to the ' +
        'unit they test; if some helper inside a spec is reusable, factor it into a regular ' +
        'utility module instead of cross-importing the spec.',
      severity: 'error',
      from: {},
      to: { path: '\\.(spec|test)\\.(ts|js)$' },
    },
    {
      name: 'not-to-unresolvable',
      comment:
        'Catch broken paths early: any import that fails to resolve to a real file or package ' +
        'is flagged. This is the dep-cruiser equivalent of import/no-unresolved (which we keep ' +
        'off in ESLint to avoid double-reporting and tsconfig-paths edge cases).',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: 'no-orphans',
      comment:
        'Warn-only: a TS/JS source that no other module imports is likely dead code. Excluded: ' +
        'dotfiles, .d.ts declaration files, and tsconfig*.json — these are configs and not ' +
        'expected to be imported.',
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: ['(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$', '\\.d\\.ts$', '(^|/)tsconfig.*\\.json$'],
      },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: 'test-setup\\.ts$|.*\\.spec\\.ts$|jest\\.config\\.ts$' },
    // Restrict scanning to the monorepo source tree. Keeps reports focused and
    // skips /dist, /coverage, /tmp, /node_modules.
    includeOnly: '^(libs|apps)/',
    // Resolve TS path aliases via tsconfig.base.json (where @intapp/* lives).
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.base.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
      mainFields: ['main', 'types'],
    },
  },
};
