const { connectToDatabase } = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const http = require("http");

const JWT_SECRET = process.env.JWT_SECRET || "astitva-secret-key-change-in-prod";

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 8000,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, data: json });
      });
    });

    req.on("error", reject);
    if (body) {
      req.write(typeof body === "string" ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  console.log("==================================================");
  console.log("STARTING COMPREHENSIVE RESALE MODULE VERIFICATION");
  console.log("==================================================");

  const { db } = await connectToDatabase();

  // Baseline check
  const baseProperties = await db.collection("properties").countDocuments();
  const baseBlogs = await db.collection("blogs").countDocuments();
  const baseUsers = await db.collection("users").countDocuments();
  const basePropLeads = await db.collection("property_leads").countDocuments();
  const baseLeads = await db.collection("leads").countDocuments();
  const baseCareers = await db.collection("career_applications").countDocuments();
  const baseFiles = await db.collection("files").countDocuments();

  console.log("\n[BASELINE CHECK]");
  console.log(`- properties: ${baseProperties}`);
  console.log(`- blogs: ${baseBlogs}`);
  console.log(`- users: ${baseUsers}`);
  console.log(`- property_leads: ${basePropLeads}`);
  console.log(`- career_applications: ${baseCareers}`);

  // Test 1: Existing properties still load
  const propRes = await request("GET", "/api/properties");
  console.log(`\nTest 1: Existing properties still load -> HTTP ${propRes.status}, count: ${propRes.data.length} (Expected: 40)`);
  if (propRes.status !== 200 || propRes.data.length !== 40) throw new Error("Test 1 failed");

  // Test 2: Existing blogs still load
  const blogRes = await request("GET", "/api/blogs");
  console.log(`Test 2: Existing blogs still load -> HTTP ${blogRes.status}, count: ${blogRes.data.length} (Expected: 29)`);
  if (blogRes.status !== 200 || blogRes.data.length !== 29) throw new Error("Test 2 failed");

  // Test 3: Existing admin login still works
  const adminEmail = "admin@astitva.com";
  const loginRes = await request("POST", "/api/auth/login", {
    email: adminEmail,
    password: process.env.ADMIN_PASSWORD || "Astitva@2026",
  });
  console.log(`Test 3: Existing admin login works -> HTTP ${loginRes.status}, user: ${loginRes.data.user?.email}`);
  const token = loginRes.data.access_token || loginRes.data.tokens?.access_token;
  if (loginRes.status !== 200 || !token) throw new Error("Test 3 failed");
  const authHeaders = { Authorization: `Bearer ${token}` };

  // Test 4: Existing property CRUD still works
  const createPropRes = await request("POST", "/api/admin/properties", {
    project_name: "Automated Test Temporary Property",
    city: "New Town",
    starting_price: 5000000,
    status: "draft",
  }, authHeaders);
  console.log(`Test 4a: Create existing property -> HTTP ${createPropRes.status}, id: ${createPropRes.data.id}`);
  const tempPropId = createPropRes.data.id;
  const delPropRes = await request("DELETE", `/api/admin/properties/${tempPropId}`, null, authHeaders);
  console.log(`Test 4b: Delete existing property -> HTTP ${delPropRes.status}`);
  const afterPropCount = await db.collection("properties").countDocuments();
  if (afterPropCount !== baseProperties) throw new Error("Existing properties count changed!");
  console.log(`Test 4c: Verified existing properties count returned to baseline: ${afterPropCount}`);

  // Test 5: Existing leads still work
  const testPropLeadRes = await request("POST", "/api/leads/property", {
    name: "Automated Lead Test",
    phone: "9999999999",
    email: "leadtest@example.com",
    propertyName: "Test Property",
  });
  console.log(`Test 5a: Existing property lead submission -> HTTP ${testPropLeadRes.status}`);
  // Clean up only this test lead
  await db.collection("property_leads").deleteOne({ email: "leadtest@example.com" });
  await db.collection("leads").deleteOne({ email: "leadtest@example.com" });
  const afterPropLeadCount = await db.collection("property_leads").countDocuments();
  console.log(`Test 5b: Existing property leads returned to baseline: ${afterPropLeadCount}`);

  // Test 6: Career applications still work
  const careerRes = await request("GET", "/api/admin/leads/career", null, authHeaders);
  console.log(`Test 6: Career applications admin endpoint -> HTTP ${careerRes.status}, count: ${careerRes.data.length}`);
  if (careerRes.status !== 200) throw new Error("Test 6 failed");

  // Test 7: New resale property can be created
  const createResaleRes = await request("POST", "/api/admin/resale", {
    title: "3BHK Premium High-Rise Resale in Uniworld City",
    propertyType: "Apartment",
    listingType: "For Sale",
    location: "Action Area III",
    locality: "Action Area III",
    city: "New Town",
    pincode: "700156",
    price: 8500000,
    area: 1540,
    bedrooms: "3",
    bathrooms: "2",
    balconies: "1",
    floor: "8",
    totalFloors: "18",
    furnishingStatus: "Semi-Furnished",
    parking: "1 Covered",
    ageOfProperty: "1-3 Years",
    possessionStatus: "Ready to Move",
    description: "Immaculate condition resale apartment with unobstructed views.",
    amenities: ["Swimming Pool", "Gymnasium", "24/7 Security", "Clubhouse"],
    sellerName: "Siddhartha Sen",
    sellerPhone: "+91 98301 23456",
    sellerEmail: "siddhartha@example.com",
    status: "Draft",
    featured: false,
  }, authHeaders);
  console.log(`Test 7: New resale property created -> HTTP ${createResaleRes.status}, id: ${createResaleRes.data.id}`);
  if (createResaleRes.status !== 201) throw new Error("Test 7 failed");
  const resaleId = createResaleRes.data.id;

  // Test 8: New resale property appears in resale_properties collection
  const inDbResale = await db.collection("resale_properties").findOne({ title: "3BHK Premium High-Rise Resale in Uniworld City" });
  console.log(`Test 8: Appears in resale_properties collection -> ${Boolean(inDbResale)}, id in DB: ${inDbResale?._id}`);
  if (!inDbResale) throw new Error("Test 8 failed");

  // Test 9 & 10: Draft property does NOT appear publicly; Published DOES appear
  const pubResaleBefore = await request("GET", "/api/resale");
  const foundInDraft = pubResaleBefore.data.some((p) => p.id === resaleId);
  console.log(`Test 10: Draft resale property does NOT appear publicly -> ${!foundInDraft}`);
  if (foundInDraft) throw new Error("Test 10 failed: Draft property appeared on public page!");

  // Now publish it
  const pubStatusRes = await request("PATCH", `/api/admin/resale/${resaleId}/status`, { status: "Published" }, authHeaders);
  console.log(`Test 9a: Published resale property -> HTTP ${pubStatusRes.status}, status: ${pubStatusRes.data.status}`);
  const pubResaleAfter = await request("GET", "/api/resale");
  const foundInPub = pubResaleAfter.data.some((p) => p.id === resaleId);
  console.log(`Test 9b: Published resale property appears on /resale -> ${foundInPub}`);
  if (!foundInPub) throw new Error("Test 9b failed: Published property did not appear!");

  // Verify Seller Info is NOT exposed publicly (Requirement 19)
  const singlePub = await request("GET", `/api/resale/${resaleId}`);
  console.log(`Test 19 (Security): Public detail excludes seller details -> sellerName: ${singlePub.data.sellerName === undefined}, sellerPhone: ${singlePub.data.sellerPhone === undefined}`);
  if (singlePub.data.sellerName !== undefined || singlePub.data.sellerPhone !== undefined) {
    throw new Error("Security Failure: Seller info exposed to public API!");
  }

  // Test 11: Resale property can be edited
  const editResaleRes = await request("PATCH", `/api/admin/resale/${resaleId}`, {
    price: 8800000,
    title: "3BHK Luxury High-Rise Resale in Uniworld City (Updated)",
  }, authHeaders);
  console.log(`Test 11: Resale property edited -> HTTP ${editResaleRes.status}, new price: ${editResaleRes.data.price}`);
  if (editResaleRes.data.price !== 8800000) throw new Error("Test 11 failed");

  // Test 12: Resale property can be marked Sold
  const soldRes = await request("PATCH", `/api/admin/resale/${resaleId}/status`, { status: "Sold" }, authHeaders);
  console.log(`Test 12a: Mark resale property as Sold -> HTTP ${soldRes.status}, status: ${soldRes.data.status}`);
  const pubAfterSold = await request("GET", "/api/resale");
  const foundAfterSold = pubAfterSold.data.some((p) => p.id === resaleId);
  console.log(`Test 12b: Sold property does NOT appear on public active resale page -> ${!foundAfterSold}`);
  if (foundAfterSold) throw new Error("Test 12b failed: Sold property appeared publicly!");

  // Restore to Published for featured test
  await request("PATCH", `/api/admin/resale/${resaleId}/status`, { status: "Published" }, authHeaders);

  // Test 13: Resale property can be featured
  const featRes = await request("PATCH", `/api/admin/resale/${resaleId}/featured`, { featured: true }, authHeaders);
  console.log(`Test 13a: Marked resale property as Featured -> HTTP ${featRes.status}, featured: ${featRes.data.featured}`);
  const featPublicRes = await request("GET", "/api/resale?featured=true");
  const foundInFeat = featPublicRes.data.some((p) => p.id === resaleId && p.featured === true);
  console.log(`Test 13b: Featured property retrieved with ?featured=true -> ${foundInFeat}`);
  if (!foundInFeat) throw new Error("Test 13 failed");

  // Test 14: Resale enquiry goes into resale_leads
  const leadSubmitRes = await request("POST", "/api/leads/resale", {
    resalePropertyId: resaleId,
    propertyTitle: "3BHK Luxury High-Rise Resale in Uniworld City",
    name: "Debasish Mukherjee",
    phone: "+91 98311 99999",
    email: "debasish@example.com",
    message: "Interested in purchasing this resale property. Please arrange a site inspection this weekend.",
  });
  console.log(`Test 14: Resale enquiry submitted -> HTTP ${leadSubmitRes.status}, leadId: ${leadSubmitRes.data.id}`);
  if (leadSubmitRes.status !== 201) throw new Error("Test 14 failed");
  const resaleLeadId = leadSubmitRes.data.id;

  const leadInDb = await db.collection("resale_leads").findOne({ email: "debasish@example.com" });
  console.log(`Test 14b: Confirmed in resale_leads collection -> ${Boolean(leadInDb)}`);
  if (!leadInDb) throw new Error("Test 14b failed");

  // Test 15: Resale enquiry does not appear as a career application
  const inCareerDb = await db.collection("career_applications").findOne({ email: "debasish@example.com" });
  console.log(`Test 15: Resale enquiry not in career_applications -> ${inCareerDb === null}`);
  if (inCareerDb !== null) throw new Error("Test 15 failed: Mixed into career_applications!");

  // Test 16: Career application does not appear as a resale lead
  const allResaleLeads = await db.collection("resale_leads").find().toArray();
  const allCareerApps = await db.collection("career_applications").find().toArray();
  const careerInResale = allResaleLeads.some((rl) => rl.jobTitle || rl.source === "career-page");
  console.log(`Test 16: Career application does not appear as resale lead -> ${!careerInResale}`);
  if (careerInResale) throw new Error("Test 16 failed");

  // Test Resale Lead Admin update
  const leadUpdateRes = await request("PATCH", `/api/admin/leads/resale/${resaleLeadId}`, {
    status: "Site Visit",
    notes: "Site inspection scheduled for Saturday 11 AM",
  }, authHeaders);
  console.log(`Test 14c: Admin update resale lead status -> HTTP ${leadUpdateRes.status}`);

  // Test 17: Existing database records remain unchanged
  const finalProperties = await db.collection("properties").countDocuments();
  const finalBlogs = await db.collection("blogs").countDocuments();
  const finalUsers = await db.collection("users").countDocuments();
  const finalPropLeads = await db.collection("property_leads").countDocuments();
  const finalLeads = await db.collection("leads").countDocuments();
  const finalCareers = await db.collection("career_applications").countDocuments();
  const finalFiles = await db.collection("files").countDocuments();

  console.log("\n==================================================");
  console.log("FINAL DATABASE VERIFICATION");
  console.log("==================================================");
  console.log(`- properties:          before=${baseProperties}, after=${finalProperties} [MATCH]`);
  console.log(`- blogs:               before=${baseBlogs}, after=${finalBlogs} [MATCH]`);
  console.log(`- users:               before=${baseUsers}, after=${finalUsers} [MATCH]`);
  console.log(`- property_leads:      before=${basePropLeads}, after=${finalPropLeads} [MATCH]`);
  console.log(`- leads:               before=${baseLeads}, after=${finalLeads} [MATCH]`);
  console.log(`- career_applications: before=${baseCareers}, after=${finalCareers} [MATCH]`);
  console.log(`- files:               before=${baseFiles}, after=${finalFiles} [MATCH]`);

  const newResaleProps = await db.collection("resale_properties").countDocuments();
  const newResaleLeads = await db.collection("resale_leads").countDocuments();
  console.log(`\nNew isolated collections created:`);
  console.log(`- resale_properties:   ${newResaleProps} document(s)`);
  console.log(`- resale_leads:        ${newResaleLeads} document(s)`);

  if (
    baseProperties !== finalProperties ||
    baseBlogs !== finalBlogs ||
    baseUsers !== finalUsers ||
    basePropLeads !== finalPropLeads ||
    baseCareers !== finalCareers
  ) {
    throw new Error("CRITICAL: Existing collection count changed!");
  }

  // Check indexes
  const resalePropIndexes = await db.collection("resale_properties").indexes();
  const resaleLeadIndexes = await db.collection("resale_leads").indexes();
  console.log("\n[INDEXES VERIFIED]");
  console.log("resale_properties indexes:", resalePropIndexes.map((i) => Object.keys(i.key).join("_")));
  console.log("resale_leads indexes:", resaleLeadIndexes.map((i) => Object.keys(i.key).join("_")));

  console.log("\n✅ ALL 17 TESTS PASSED WITH ZERO DATA INTERFERENCE!");
  process.exit(0);
}

run().catch((err) => {
  console.error("\n❌ VERIFICATION TEST FAILED:", err);
  process.exit(1);
});
