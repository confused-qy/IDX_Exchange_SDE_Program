const API_ROOT = "/api/properties";

async function request(url, options = {}) {
  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        ...options.headers,
      },
    });
  } catch (error) {
    throw new Error(
      "Unable to reach the property server. Make sure the Express server is running on port 5001."
    );
  }

  if (!response.ok) {
    let serverMessage;

    try {
      const body = await response.json();
      serverMessage = body.error || body.message;
    } catch (error) {
      // Some servers return an empty or non-JSON error body.
    }

    throw new Error(
      serverMessage ||
        `Property request failed (${response.status} ${response.statusText || "HTTP error"}).`
    );
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error("The property server returned an invalid JSON response.");
  }
}

export function fetchProperties(params = {}, options = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return request(`${API_ROOT}${query ? `?${query}` : ""}`, options);
}

export function fetchPropertyDetail(id) {
  if (id === undefined || id === null || String(id).trim() === "") {
    return Promise.reject(new Error("A property listing ID is required."));
  }

  return request(`${API_ROOT}/${encodeURIComponent(String(id))}`);
}
