// @prisma/client lists the Prisma CLI as an optional peer, which makes pnpm pull the whole CLI (studio, pglite, typescript, ...)
// into the production dependency graph. The API generates the client explicitly, so the runtime never needs it.
function readPackage(pkg) {
  if (pkg.name === "@prisma/client") {
    delete pkg.peerDependencies?.prisma;
    delete pkg.peerDependenciesMeta?.prisma;
  }
  return pkg;
}

module.exports = { hooks: { readPackage } };
