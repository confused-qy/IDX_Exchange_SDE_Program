const express = require("express");
const request = require("supertest");

jest.mock("../db", () => ({ query: jest.fn() }));

const pool = require("../db");
const propertiesRouter = require("./properties");

const app = express();
app.use("/api/properties", propertiesRouter);

const property = {
  id: 1,
  L_ListingID: "MLS-100",
  L_Address: "100 Market Street",
  L_City: "Seattle",
  L_SystemPrice: 750000,
};

beforeEach(() => {
  pool.query.mockReset();
});

function mockList(total = 1, results = [property]) {
  pool.query.mockResolvedValueOnce([[{ total }]]).mockResolvedValueOnce([results]);
}

describe("GET /api/properties", () => {
  test("returns properties with default pagination and sorting", async () => {
    mockList();
    const response = await request(app).get("/api/properties");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      total: 1,
      limit: 20,
      offset: 0,
      sortBy: "ListingContractDate",
      sortOrder: "desc",
      results: [property],
    });
    expect(pool.query.mock.calls[1][1]).toEqual([20, 0]);
  });

  test("applies limit, offset, and an allowed sort", async () => {
    mockList(42, []);
    const response = await request(app).get(
      "/api/properties?limit=10&offset=20&sortBy=L_SystemPrice&sortOrder=asc"
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ total: 42, limit: 10, offset: 20 });
    expect(pool.query.mock.calls[1][0]).toContain("ORDER BY L_SystemPrice ASC, id ASC");
    expect(pool.query.mock.calls[1][1]).toEqual([10, 20]);
  });

  test.each([
    ["city=Seattle", "L_City = ?", "Seattle"],
    ["zipcode=98101", "L_Zip = ?", "98101"],
    ["minPrice=300000", "L_SystemPrice >= ?", 300000],
    ["maxPrice=900000", "L_SystemPrice <= ?", 900000],
    ["beds=3", "L_Keyword2 = ?", 3],
    ["baths=2.5", "LM_Dec_3 = ?", 2.5],
  ])("applies the %s filter", async (query, sqlFragment, value) => {
    mockList();
    const response = await request(app).get(`/api/properties?${query}`);

    expect(response.status).toBe(200);
    expect(pool.query.mock.calls[0][0]).toContain(sqlFragment);
    expect(pool.query.mock.calls[0][1]).toEqual([value]);
    expect(pool.query.mock.calls[1][1]).toEqual([value, 20, 0]);
  });

  test("combines filters and trims city values", async () => {
    mockList();
    const response = await request(app).get(
      "/api/properties?city=%20Seattle%20&minPrice=400000&maxPrice=800000"
    );

    expect(response.status).toBe(200);
    expect(pool.query.mock.calls[0][0]).toContain(
      "WHERE L_City = ? AND L_SystemPrice >= ? AND L_SystemPrice <= ?"
    );
    expect(pool.query.mock.calls[0][1]).toEqual(["Seattle", 400000, 800000]);
  });

  test.each([
    ["unknown=yes", "Unknown query parameter"],
    ["limit=0", "limit must be at least 1"],
    ["limit=101", "limit must be at most 100"],
    ["offset=-1", "offset must be a whole number"],
    ["minPrice=abc", "minPrice must be a whole number"],
    ["baths=nope", "baths must be a number"],
    ["minPrice=900&maxPrice=100", "minPrice cannot be greater"],
    ["sortBy=DROP_TABLE", "sortBy must be one of"],
    ["sortOrder=sideways", "sortOrder must be asc or desc"],
    ["city=", "city cannot be empty"],
  ])("rejects invalid query %s", async (query, message) => {
    const response = await request(app).get(`/api/properties?${query}`);
    expect(response.status).toBe(400);
    expect(response.body.error).toContain(message);
    expect(pool.query).not.toHaveBeenCalled();
  });
});

describe("GET /api/properties/:id", () => {
  test("returns a matching property", async () => {
    pool.query.mockResolvedValueOnce([[property]]);
    const response = await request(app).get("/api/properties/MLS-100");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(property);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("L_ListingID = ?"), ["MLS-100"]);
  });

  test("returns 404 when the property is unknown", async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const response = await request(app).get("/api/properties/UNKNOWN");
    expect(response.status).toBe(404);
  });

  test("rejects an invalid listing ID", async () => {
    const response = await request(app).get("/api/properties/bad%20id");
    expect(response.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });
});

describe("GET /api/properties/:id/openhouses", () => {
  test("returns open houses for a known property", async () => {
    const openHouses = [{ id: 9, L_ListingID: "MLS-100", OpenHouseDate: "2026-09-05" }];
    pool.query.mockResolvedValueOnce([[{ L_ListingID: "MLS-100" }]]).mockResolvedValueOnce([openHouses]);

    const response = await request(app).get("/api/properties/MLS-100/openhouses");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(openHouses);
  });

  test("returns an empty list when a known property has no open houses", async () => {
    pool.query.mockResolvedValueOnce([[{ L_ListingID: "MLS-100" }]]).mockResolvedValueOnce([[]]);
    const response = await request(app).get("/api/properties/MLS-100/openhouses");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("returns 404 before querying open houses for an unknown property", async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const response = await request(app).get("/api/properties/UNKNOWN/openhouses");
    expect(response.status).toBe(404);
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  test("rejects an invalid listing ID", async () => {
    const response = await request(app).get("/api/properties/bad%20id/openhouses");
    expect(response.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });
});
