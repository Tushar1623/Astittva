"""Seed sample properties for demo / first run."""
import asyncio
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).parent
load_dotenv(ROOT / '.env')

from motor.motor_asyncio import AsyncIOMotorClient

SAMPLES = [
    {
        "project_name": "Aura Skylines",
        "builder": "Astitva Developments",
        "location": "Action Area II",
        "city": "New Town",
        "starting_price": 12000000,
        "price_label": "₹1.2 Cr onwards",
        "property_type": "Residential",
        "property_category": "Luxury",
        "description": "A 35-storey residential tower overlooking Eco Park — 3 & 4 BHK sky-residences with curated amenities including infinity pool, sky lounge, private cinema, and concierge service. Engineered to last a generation.",
        "images": [],
        "rera_number": "WBRERA/A/NEW/2024/001234",
        "possession_date": "Dec 2027",
        "google_maps_url": "",
        "bedrooms": "3 & 4 BHK",
        "area_sqft": "1850 - 2750",
        "amenities": ["Infinity Pool", "Sky Lounge", "Private Cinema", "Concierge", "Clubhouse", "Spa & Wellness", "Co-working Lounge"],
        "status": "published",
        "is_featured": True,
    },
    {
        "project_name": "The Rajarhat Reserve",
        "builder": "Verdant Estates",
        "location": "Rajarhat Main Road",
        "city": "Rajarhat",
        "starting_price": 8500000,
        "price_label": "₹85 L onwards",
        "property_type": "Apartment",
        "property_category": "Premium",
        "description": "Low-density premium apartments spread across landscaped gardens. 2 & 3 BHK homes with double-height living rooms, biophilic design, and an emphasis on natural light.",
        "images": [],
        "rera_number": "WBRERA/A/RAJ/2024/002145",
        "possession_date": "Jun 2026",
        "google_maps_url": "",
        "bedrooms": "2 & 3 BHK",
        "area_sqft": "1100 - 1650",
        "amenities": ["Landscaped Gardens", "Yoga Pavilion", "Children's Play Zone", "EV Charging", "24x7 Security"],
        "status": "published",
        "is_featured": True,
    },
    {
        "project_name": "Heritage House Kolkata",
        "builder": "Calcutta Crafted",
        "location": "Alipore",
        "city": "Kolkata",
        "starting_price": 45000000,
        "price_label": "₹4.5 Cr onwards",
        "property_type": "Villa",
        "property_category": "Luxury",
        "description": "A limited edition of nine standalone villas in Alipore — colonial-era plots reimagined with contemporary architecture, private courtyards, and a heritage facade.",
        "images": [],
        "rera_number": "WBRERA/A/KOL/2024/003011",
        "possession_date": "Mar 2027",
        "google_maps_url": "",
        "bedrooms": "5 BHK Villas",
        "area_sqft": "4200 - 5800",
        "amenities": ["Private Pool", "Home Theatre", "Smart Home Automation", "Service Quarters", "Private Lift"],
        "status": "published",
        "is_featured": True,
    },
    {
        "project_name": "Equinox Commercial Tower",
        "builder": "Astitva Commercial",
        "location": "Sector V Extension",
        "city": "New Town",
        "starting_price": 6500000,
        "price_label": "₹65 L per office",
        "property_type": "Commercial",
        "property_category": "Premium",
        "description": "Grade-A commercial offices in the heart of New Town's IT corridor. LEED-Gold certified, designed for global tenants and growing Indian enterprises alike.",
        "images": [],
        "rera_number": "WBRERA/C/NEW/2024/004012",
        "possession_date": "Sep 2026",
        "google_maps_url": "",
        "bedrooms": "",
        "area_sqft": "500 - 5000",
        "amenities": ["LEED Gold Certified", "24x7 Power Backup", "Multi-level Parking", "Cafeteria", "Conference Suites"],
        "status": "published",
        "is_featured": False,
    },
    {
        "project_name": "Lakeview Premia",
        "builder": "Verdant Estates",
        "location": "Eco Park Edge",
        "city": "New Town",
        "starting_price": 22000000,
        "price_label": "₹2.2 Cr onwards",
        "property_type": "Apartment",
        "property_category": "Luxury",
        "description": "Direct Eco Park frontage. 4 BHK lakefront residences with panoramic windows, private balconies overlooking the water, and exclusive lake-club access.",
        "images": [],
        "rera_number": "WBRERA/A/NEW/2024/005012",
        "possession_date": "Dec 2026",
        "google_maps_url": "",
        "bedrooms": "4 BHK",
        "area_sqft": "2400 - 2900",
        "amenities": ["Lake Club", "Private Boat Dock", "Sky Garden", "Wine Cellar", "24x7 Concierge"],
        "status": "published",
        "is_featured": True,
    },
    {
        "project_name": "Garden City Plots",
        "builder": "Astitva Developments",
        "location": "Rajarhat North",
        "city": "Rajarhat",
        "starting_price": 3500000,
        "price_label": "₹35 L per plot",
        "property_type": "Plot",
        "property_category": "Premium",
        "description": "Gated community plots ranging from 1200 to 2500 sqft. Underground utilities, themed boulevards, and approval-ready titles — ideal for custom villa construction.",
        "images": [],
        "rera_number": "WBRERA/P/RAJ/2024/006021",
        "possession_date": "Ready",
        "google_maps_url": "",
        "bedrooms": "",
        "area_sqft": "1200 - 2500",
        "amenities": ["Gated Community", "Themed Boulevards", "Underground Utilities", "Community Park"],
        "status": "published",
        "is_featured": False,
    },
]


async def main():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    existing = await db.properties.count_documents({})
    if existing > 0:
        print(f"Properties collection already has {existing} docs — skipping seed.")
        return
    now = datetime.now(timezone.utc).isoformat()
    for p in SAMPLES:
        p["created_at"] = now
        p["updated_at"] = now
    await db.properties.insert_many(SAMPLES)
    print(f"Inserted {len(SAMPLES)} sample properties.")


if __name__ == "__main__":
    asyncio.run(main())
