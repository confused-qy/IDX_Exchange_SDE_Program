import { formatNumber, formatPrice, getFirstPhoto } from "./property";

describe("getFirstPhoto", () => {
  test.each([
    [null, null],
    [undefined, null],
    ["", null],
    ["null", null],
    ["[]", null],
    ["not valid json", null],
    ["{}", null],
    ['["", null, 10]', null],
  ])("handles missing or malformed value %#", (value, expected) => {
    expect(getFirstPhoto(value)).toBe(expected);
  });

  test("returns the first non-empty URL in a JSON array", () => {
    expect(getFirstPhoto('["", " https://example.com/home.jpg "]')).toBe(
      "https://example.com/home.jpg"
    );
  });

  test("also accepts an already parsed array", () => {
    expect(getFirstPhoto([null, "https://example.com/home.jpg"])).toBe(
      "https://example.com/home.jpg"
    );
  });
});

describe("property formatters", () => {
  test("formats valid property values", () => {
    expect(formatPrice(450000)).toBe("$450,000");
    expect(formatNumber(1850)).toBe("1,850");
  });

  test("uses fallbacks for invalid values", () => {
    expect(formatPrice(undefined)).toBe("Price unavailable");
    expect(formatNumber(undefined)).toBe("—");
  });
});
