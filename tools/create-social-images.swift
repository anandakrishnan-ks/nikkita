import AppKit
import Foundation

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let photo = NSImage(contentsOf: root.appendingPathComponent("assets/images/social/source-dubai-skyline.jpg"))!
let logo = NSImage(contentsOf: root.appendingPathComponent("assets/images/brand/logo.png"))!
let output = root.appendingPathComponent("assets/images/social")
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)

func color(_ hex: Int, alpha: CGFloat = 1) -> NSColor {
    NSColor(calibratedRed: CGFloat((hex >> 16) & 255) / 255,
            green: CGFloat((hex >> 8) & 255) / 255,
            blue: CGFloat(hex & 255) / 255, alpha: alpha)
}

func text(_ value: String, in rect: NSRect, size: CGFloat, weight: NSFont.Weight, color ink: NSColor) {
    let style = NSMutableParagraphStyle()
    style.lineSpacing = 7
    (value as NSString).draw(in: rect, withAttributes: [
        .font: NSFont.systemFont(ofSize: size, weight: weight),
        .foregroundColor: ink,
        .paragraphStyle: style
    ])
}

func create(name: String, width: Int, height: Int, square: Bool) {
    let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: width, pixelsHigh: height,
                                  bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true,
                                  isPlanar: false, colorSpaceName: .deviceRGB,
                                  bytesPerRow: 0, bitsPerPixel: 0)!
    let context = NSGraphicsContext(bitmapImageRep: bitmap)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = context
    context.imageInterpolation = .high
    let canvas = NSRect(x: 0, y: 0, width: width, height: height)
    color(0x102b24).setFill()
    canvas.fill()
    let photoRect = square ? NSRect(x: 0, y: 350, width: width, height: 850)
                           : NSRect(x: 490, y: 0, width: 710, height: 630)
    photo.draw(in: photoRect, from: .zero, operation: .sourceOver, fraction: square ? 0.55 : 0.72)
    let gradient = NSGradient(starting: color(0x102b24, alpha: square ? 0.96 : 1),
                              ending: color(0x102b24, alpha: square ? 0.54 : 0.25))!
    gradient.draw(in: canvas, angle: square ? 90 : 0)
    let left: CGFloat = square ? 92 : 72
    let logoY: CGFloat = square ? 920 : 440
    logo.draw(in: NSRect(x: left, y: logoY, width: square ? 480 : 370, height: square ? 167 : 129),
              from: .zero, operation: .sourceOver, fraction: 1)
    color(0xd7a725).setFill()
    NSRect(x: left, y: square ? 840 : 404, width: square ? 98 : 76, height: 4).fill()
    text("Business setup & advisory", in: NSRect(x: left, y: square ? 685 : 274,
                                                   width: square ? 1020 : 1050, height: square ? 125 : 80),
         size: square ? 59 : 54, weight: .semibold, color: .white)
    text("UAE  ·  Saudi Arabia  ·  Bahrain", in: NSRect(x: left, y: square ? 604 : 219,
                                                        width: square ? 1030 : 1020, height: 55),
         size: square ? 33 : 31, weight: .medium, color: color(0xf0d389))
    text("Clarity shapes decisions.", in: NSRect(x: left, y: square ? 130 : 64,
                                                  width: square ? 1020 : 950, height: 48),
         size: square ? 29 : 25, weight: .regular, color: color(0xf4f1e9))
    context.flushGraphics()
    NSGraphicsContext.restoreGraphicsState()
    let data = bitmap.representation(using: .jpeg, properties: [.compressionFactor: 0.87])!
    try! data.write(to: output.appendingPathComponent(name))
}

create(name: "nikki-advisory-og.jpg", width: 1200, height: 630, square: false)
create(name: "nikki-advisory-square.jpg", width: 1200, height: 1200, square: true)
