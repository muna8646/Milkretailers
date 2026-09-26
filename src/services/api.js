const API_URL = "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem(
    "milkcollect_token"
  );

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),

        ...(options.headers || {}),
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong"
    );
  }

  return data;
}

export async function login(email, password) {
  return request("/auth/login", {
    method: "POST",

    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export async function registerRetailer(data) {
  return request("/auth/register-retailer", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAdminDashboard() {
  return request("/admin/dashboard");
}

export async function getAdminSystemInfo() {
  return request("/admin/system-info");
}

export async function changeAdminPassword(currentPassword, newPassword) {
  return request("/admin/password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function getRetailerDashboard() {
  return request("/retailer/dashboard");
}

export async function getRetailerProfile() {
  return request("/retailer/profile");
}

export async function getRetailerReports() {
  return request("/retailer/reports");
}

export async function changeRetailerPassword(currentPassword, newPassword) {
  return request("/retailer/password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function getRetailers() {
  return request("/admin/retailers");
}

export async function getRetailer(id) {
  return request(`/admin/retailers/${id}`);
}

export async function createRetailer(data) {
  return request("/admin/retailers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateRetailer(id, data) {
  return request(`/admin/retailers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function updateRetailerStatus(
  id,
  isActive
) {
  return request(
    `/admin/retailers/${id}/status`,
    {
      method: "PATCH",

      body: JSON.stringify({
        isActive,
      }),
    }
  );
}

export async function getRetailerFarmers() {
  return request("/retailer/farmers");
}

export async function createFarmer(data) {
  return request("/retailer/farmers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAdminCollections() {
  return request("/admin/collections");
}

export async function getRetailerCollections() {
  return request("/retailer/collections");
}

export async function createCollection(data) {
  return request("/retailer/collections", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAdminPayments() {
  return request("/admin/payments");
}

export async function getRetailerPayments() {
  return request("/retailer/payments");
}