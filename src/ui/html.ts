export function html({
  body,
  title = "RomM Sync",
}: {
  body: string;
  title?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  </head>
  <body class="bg-gray-100 text-gray-900">
    <div class="container mx-auto p-4">
      <header class="mb-6">
        <h1 class="text-3xl font-bold">${title}</h1>
      </header>
      <main>
        ${body}
      </main>
    </div>
    <footer class="mt-6 text-center text-gray-600">
      <p>&copy; ${new Date().getFullYear()} RomM Sync</p>
    </footer>
  </body>
</html>`;
}
