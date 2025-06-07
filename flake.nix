{
  description = "Run 'nix develop' to have a dev shell that has everything this project needs";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
            yarn
            nodePackages_latest.pnpm
            nodePackages_latest.vercel
            nodePackages_latest.prisma
            postgresql
            openssl
          ];
          # shellHook = ''
          #   		ln -sf $(pwd)/node_modules/.pnpm/@prisma+client@5.0.0_prisma@5.0.0/node_modules/.prisma/client/libquery_engine.node node_modules/.pnpm/@prisma+client@5.0.0_prisma@5.0.0/node_modules/.prisma/client/libquery_engine-linux-nixos.so.node
          # '';
          env = {
            PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines}/lib/libquery_engine.node";
            PRISMA_QUERY_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/query-engine";
            PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/schema-engine";
            DATABASE_URL = "postgresql://talkarr:talkarr@localhost:5432/talkarr?sslmode=disable";
          };
        };
      });
}
