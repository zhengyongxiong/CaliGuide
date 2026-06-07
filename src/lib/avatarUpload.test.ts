import { describe, expect, test } from "vitest";
import { readAvatarFile } from "./avatarUpload";

describe("avatarUpload", () => {
  test("converts an uploaded image file to a data URL", async () => {
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });

    const dataUrl = await readAvatarFile(file);

    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });

  test("rejects non-image uploads", async () => {
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });

    await expect(readAvatarFile(file)).rejects.toThrow("Choose an image file");
  });
});
