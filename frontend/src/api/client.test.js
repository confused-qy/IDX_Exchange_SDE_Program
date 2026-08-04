import { fetchProperties, fetchPropertyDetail } from "./client";

afterEach(() => {
  jest.restoreAllMocks();
});

test("fetchProperties builds the expected query and returns JSON", async () => {
  jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({ total: 1, results: [{ id: 1 }] }),
  });

  const data = await fetchProperties({ limit: 20, offset: 0, city: "San Jose" });

  expect(global.fetch).toHaveBeenCalledWith(
    "/api/properties?limit=20&offset=0&city=San+Jose",
    expect.objectContaining({ headers: { Accept: "application/json" } })
  );
  expect(data.total).toBe(1);
});

test("fetchProperties omits empty filter values", async () => {
  jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({ total: 0, results: [] }),
  });

  await fetchProperties({ city: "", zipcode: null, beds: undefined, baths: "2" });

  expect(global.fetch).toHaveBeenCalledWith(
    "/api/properties?baths=2",
    expect.any(Object)
  );
});

test("uses the backend error message for an HTTP error", async () => {
  jest.spyOn(global, "fetch").mockResolvedValue({
    ok: false,
    status: 400,
    statusText: "Bad Request",
    json: async () => ({ error: "limit must be at most 100" }),
  });

  await expect(fetchProperties({ limit: 101 })).rejects.toThrow(
    "limit must be at most 100"
  );
});

test("reports a helpful message when the backend is unreachable", async () => {
  jest.spyOn(global, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));

  await expect(fetchProperties()).rejects.toThrow(
    "Make sure the Express server is running on port 5001"
  );
});

test("fetchPropertyDetail validates the listing ID", async () => {
  await expect(fetchPropertyDetail(" ")).rejects.toThrow(
    "A property listing ID is required"
  );
});
