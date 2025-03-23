
{ pkgs }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    bun
    libasound2
    "libatk-bridge2.0-0"
    "libatk1.0-0"
    libcups2
    libgbm1
    libglu1
    "libgtk-3-0"
    libnss3
    "libpangocairo-1.0-0"
    "libxshmfence1"
    "libxss1"
    nodejs_18
  ];
}
