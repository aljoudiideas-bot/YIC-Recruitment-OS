const sharp = require("sharp")
const path = require("path")

const sizes = [192, 512]
const svgTemplate = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.1667)}" fill="#2563eb"/>
  <text x="${size / 2}" y="${size * 0.56}" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.round(size * 0.28)}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">YIC</text>
</svg>`

async function main() {
  const iconsDir = path.join(__dirname, "..", "public", "icons")
  for (const size of sizes) {
    await sharp(Buffer.from(svgTemplate(size))).png().toFile(path.join(iconsDir, `icon-${size}x${size}.png`))
    console.log(`Generated icon-${size}x${size}.png`)
  }
}

main().catch(console.error)
