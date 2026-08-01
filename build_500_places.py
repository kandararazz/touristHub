import json
import random
import os

category_images = {
  "Modern Architecture": [
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80"
  ],
  "Historical Site": [
    "https://images.unsplash.com/photo-1546412414-e1885259563a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1578895210405-907db48a7812?auto=format&fit=crop&w=800&q=80"
  ],
  "Museum & Art": [
    "https://images.unsplash.com/photo-1650390192534-118fa30026db?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1618255016518-e79435b67272?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80"
  ],
  "Nature & Outdoors": [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=800&q=80"
  ],
  "Beach & Waterfront": [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
  ],
  "Culture & Entertainment": [
    "https://images.unsplash.com/photo-1578895210405-907db48a7812?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80"
  ],
  "Theme Park": [
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80"
  ]
}

emirates = ["Dubai", "Abu Dhabi", "Sharjah", "Ras Al Khaimah", "Fujairah", "Ajman", "Umm Al Quwain"]
categories = ["Modern Architecture", "Historical Site", "Museum & Art", "Nature & Outdoors", "Beach & Waterfront", "Culture & Entertainment", "Theme Park"]

wifi_options = [
  {"quality": "⚡ High-Speed Wi-Fi", "details": "Free Guest Wi-Fi (No Password Required • 100+ Mbps)"},
  {"quality": "📶 Basic Wi-Fi", "details": "Public Wi-Fi Network (SMS Verification)"},
  {"quality": "❌ No Public Wi-Fi", "details": "Outdoor Venue • Cellular Mobile Data Recommended"}
]

core_landmarks = [
  {"name": "Burj Khalifa", "emirate": "Dubai", "category": "Modern Architecture", "tag": "Iconic Landmark", "fee": "From 179 AED", "img": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80", "lat": 25.1972, "lng": 55.2744, "wifi": wifi_options[0]},
  {"name": "Sheikh Zayed Grand Mosque", "emirate": "Abu Dhabi", "category": "Historical Site", "tag": "Cultural Heritage", "fee": "Free Entry", "img": "https://images.unsplash.com/photo-1546412414-e1885259563a?auto=format&fit=crop&w=800&q=80", "lat": 24.4128, "lng": 54.4750, "wifi": wifi_options[0]},
  {"name": "Museum of the Future", "emirate": "Dubai", "category": "Museum & Art", "tag": "Futuristic Tech", "fee": "149 AED", "img": "https://images.unsplash.com/photo-1650390192534-118fa30026db?auto=format&fit=crop&w=800&q=80", "lat": 25.2192, "lng": 55.2818, "wifi": wifi_options[0]},
  {"name": "Louvre Abu Dhabi", "emirate": "Abu Dhabi", "category": "Museum & Art", "tag": "Art & Architecture", "fee": "63 AED", "img": "https://images.unsplash.com/photo-1618255016518-e79435b67272?auto=format&fit=crop&w=800&q=80", "lat": 24.5336, "lng": 54.3983, "wifi": wifi_options[0]},
  {"name": "Global Village Dubai", "emirate": "Dubai", "category": "Culture & Entertainment", "tag": "Cultural Market", "fee": "25 AED", "img": "https://images.unsplash.com/photo-1578895210405-907db48a7812?auto=format&fit=crop&w=800&q=80", "lat": 25.0683, "lng": 55.3075, "wifi": wifi_options[1]},
  {"name": "Jebel Jais Mountain Peak", "emirate": "Ras Al Khaimah", "category": "Nature & Outdoors", "tag": "Adventure Peak", "fee": "Free Entry", "img": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80", "lat": 25.9525, "lng": 56.1417, "wifi": wifi_options[2]},
  {"name": "Dubai Frame", "emirate": "Dubai", "category": "Modern Architecture", "tag": "Panoramic View", "fee": "50 AED", "img": "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80", "lat": 25.2354, "lng": 55.3003, "wifi": wifi_options[0]},
  {"name": "Al Fahidi Heritage District", "emirate": "Dubai", "category": "Historical Site", "tag": "Traditional Culture", "fee": "Free Entry", "img": "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80", "lat": 25.2636, "lng": 55.3003, "wifi": wifi_options[1]},
  {"name": "Dubai Miracle Garden", "emirate": "Dubai", "category": "Nature & Outdoors", "tag": "Floral Park", "fee": "95 AED", "img": "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=800&q=80", "lat": 25.0601, "lng": 55.2444, "wifi": wifi_options[1]},
  {"name": "Hatta Dam & Wadi Hub", "emirate": "Dubai", "category": "Nature & Outdoors", "tag": "Mountain Oasis", "fee": "Free Entry", "img": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", "lat": 24.8188, "lng": 56.1264, "wifi": wifi_options[2]}
]

prefixes = ["Royal", "Grand", "Heritage", "Sunset", "Crystal", "Golden", "Emerald", "Oasis", "Pearl", "Palm", "Al Hamra", "Al Majaz", "Jumeirah", "Marina", "Corniche", "Desert Rose", "Skyline", "Al Khaleej", "Falcon", "Arabian"]
types = ["Promenade", "Viewpoint", "Beach Club", "Cultural Center", "Heritage Souk", "Adventure Park", "Botanical Garden", "Resort Cove", "Yacht Club", "Ecological Reserve", "Sky Deck", "Art Gallery", "Waterfront Plaza"]

generated_list = []

for idx, item in enumerate(core_landmarks):
    generated_list.append({
        "id": f"uae-place-{idx + 1}",
        "name": item["name"],
        "emirate": item["emirate"],
        "category": item["category"],
        "tag": item["tag"],
        "entryFee": item["fee"],
        "wifiQuality": item["wifi"]["quality"],
        "wifiDetails": item["wifi"]["details"],
        "rating": round(4.6 + (idx % 4) * 0.1, 1),
        "reviews": f"{10000 + (idx * 2300):,} reviews",
        "description": f"Experience the beauty and cultural brilliance of {item['name']} in {item['emirate']}. An unmissable UAE destination offering unforgettable views, rich history, and world-class hospitality.",
        "latitude": item["lat"],
        "longitude": item["lng"],
        "address": f"{item['name']}, {item['emirate']}, United Arab Emirates",
        "imageUrl": item["img"],
        "googleMapsUrl": f"https://www.google.com/maps/search/?api=1&query={item['name'].replace(' ', '+')}+{item['emirate'].replace(' ', '+')}",
        "highlights": ["Panoramic Views", "Cultural Heritage", "Free Wi-Fi Connectivity"],
        "bestTime": "Late Afternoon & Sunset",
        "userReviews": [
            {
                "author": "Sarah M.",
                "rating": 5,
                "date": "2026-07-28",
                "comment": f"Outstanding visit to {item['name']}!"
            }
        ]
    })

count = len(generated_list)
target = 525

coords_map = {
    "Dubai": (25.2048, 55.2708),
    "Abu Dhabi": (24.4539, 54.3773),
    "Sharjah": (25.3463, 55.4209),
    "Ras Al Khaimah": (25.7895, 55.9432),
    "Fujairah": (25.1288, 56.3265),
    "Ajman": (25.4052, 55.5136),
    "Umm Al Quwain": (25.5647, 55.5564)
}

while count < target:
    emirate = emirates[count % len(emirates)]
    category = categories[count % len(categories)]
    prefix = prefixes[count % len(prefixes)]
    typ = types[(count + 3) % len(types)]
    name = f"{prefix} {typ} of {emirate}"
    fee = "Free Entry" if (count % 3 == 0) else f"From {20 + (count % 8) * 15} AED"
    imgs = category_images.get(category, category_images["Modern Architecture"])
    img_url = imgs[count % len(imgs)]
    
    wifi = wifi_options[count % len(wifi_options)]

    base_lat, base_lng = coords_map[emirate]
    lat = round(base_lat + (random.random() - 0.5) * 0.18, 4)
    lng = round(base_lng + (random.random() - 0.5) * 0.18, 4)

    generated_list.append({
        "id": f"uae-place-{count + 1}",
        "name": name,
        "emirate": emirate,
        "category": category,
        "tag": f"{category.split(' ')[0]} Spot",
        "entryFee": fee,
        "wifiQuality": wifi["quality"],
        "wifiDetails": wifi["details"],
        "rating": round(4.5 + (count % 5) * 0.1, 1),
        "reviews": f"{1200 + (count * 45):,} reviews",
        "description": f"Discover {name}, a premier {category.lower()} attraction in {emirate}. Enjoy picturesque scenery, rich culture, and exceptional hospitality.",
        "latitude": lat,
        "longitude": lng,
        "address": f"{name}, {emirate}, United Arab Emirates",
        "imageUrl": img_url,
        "googleMapsUrl": f"https://www.google.com/maps/search/?api=1&query={name.replace(' ', '+')}",
        "highlights": ["Scenic Location", "Family Friendly", "Photography Hotspot"],
        "bestTime": "Daytime & Sunset",
        "userReviews": [
            {
                "author": "Explorer",
                "rating": 5,
                "date": "2026-07-28",
                "comment": f"Great destination to visit in {emirate}!"
            }
        ]
    })
    count += 1

output_path = os.path.join(os.path.dirname(__file__), 'data', 'attractions.json')
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(generated_list, f, indent=2)

print(f"Successfully updated dataset with Wi-Fi Quality indicators across {len(generated_list)} places!")
