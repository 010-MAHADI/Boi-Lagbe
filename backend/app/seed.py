"""
Database seeder — run once after migrations to populate institutes and an admin user.
Usage:  python -m app.seed
"""
import asyncio
from .database import AsyncSessionLocal, engine, Base
from .models import User, Institute
from .auth import hash_password
import uuid


INSTITUTES = [
    ("ঢাকা পলিটেকনিক ইনস্টিটিউট", "Dhaka Polytechnic Institute", "polytechnic", "ঢাকা", "dhaka", 23.7260, 90.3913),
    ("রাজশাহী পলিটেকনিক ইনস্টিটিউট", "Rajshahi Polytechnic Institute", "polytechnic", "রাজশাহী", "rajshahi", 24.3745, 88.6042),
    ("চট্টগ্রাম পলিটেকনিক ইনস্টিটিউট", "Chattogram Polytechnic Institute", "polytechnic", "চট্টগ্রাম", "chattogram", 22.3569, 91.7832),
    ("বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয় (বুয়েট)", "BUET", "university", "ঢাকা", "dhaka", 23.7266, 90.3926),
    ("ঢাকা বিশ্ববিদ্যালয়", "University of Dhaka", "university", "ঢাকা", "dhaka", 23.7339, 90.3926),
    ("জাহাঙ্গীরনগর বিশ্ববিদ্যালয়", "Jahangirnagar University", "university", "ঢাকা", "dhaka", 23.8827, 90.2676),
    ("কুমিল্লা পলিটেকনিক ইনস্টিটিউট", "Cumilla Polytechnic Institute", "polytechnic", "কুমিল্লা", "chattogram", 23.4607, 91.1809),
    ("ময়মনসিংহ পলিটেকনিক ইনস্টিটিউট", "Mymensingh Polytechnic Institute", "polytechnic", "ময়মনসিংহ", "mymensingh", 24.7471, 90.4203),
    ("বরিশাল পলিটেকনিক ইনস্টিটিউট", "Barishal Polytechnic Institute", "polytechnic", "বরিশাল", "barishal", 22.7010, 90.3535),
    ("সিলেট পলিটেকনিক ইনস্টিটিউট", "Sylhet Polytechnic Institute", "polytechnic", "সিলেট", "sylhet", 24.8949, 91.8687),
    ("ঢাকা কলেজ", "Dhaka College", "college", "ঢাকা", "dhaka", 23.7330, 90.3980),
    ("নটর ডেম কলেজ", "Notre Dame College", "college", "ঢাকা", "dhaka", 23.7372, 90.3880),
    ("রাজশাহী কলেজ", "Rajshahi College", "college", "রাজশাহী", "rajshahi", 24.3636, 88.6241),
    ("বগুড়া পলিটেকনিক ইনস্টিটিউট", "Bogura Polytechnic Institute", "polytechnic", "বগুড়া", "rajshahi", 24.8465, 88.8695),
    ("পাবনা পলিটেকনিক ইনস্টিটিউট", "Pabna Polytechnic Institute", "polytechnic", "পাবনা", "rajshahi", 24.0064, 89.2372),
    ("ফেনী পলিটেকনিক ইনস্টিটিউট", "Feni Polytechnic Institute", "polytechnic", "ফেনী", "chattogram", 23.0159, 91.3976),
    ("যশোর পলিটেকনিক ইনস্টিটিউট", "Jessore Polytechnic Institute", "polytechnic", "যশোর", "khulna", 23.1634, 89.2132),
    ("রংপুর পলিটেকনিক ইনস্টিটিউট", "Rangpur Polytechnic Institute", "polytechnic", "রংপুর", "rangpur", 25.7439, 89.2752),
    ("খুলনা প্রকৌশল ও প্রযুক্তি বিশ্ববিদ্যালয় (কুয়েট)", "KUET", "university", "খুলনা", "khulna", 22.9006, 89.5024),
    ("চট্টগ্রাম কলেজ", "Chattogram College", "college", "চট্টগ্রাম", "chattogram", 22.3419, 91.8266),
]


async def seed():
    async with AsyncSessionLocal() as session:
        # Create tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        # Seed institutes (skip if already exist)
        for (name, name_en, type_, district, division, lat, lng) in INSTITUTES:
            from sqlalchemy import select
            result = await session.execute(
                select(Institute).where(Institute.name == name)
            )
            if not result.scalar_one_or_none():
                session.add(Institute(
                    id=str(uuid.uuid4()),
                    name=name,
                    name_en=name_en,
                    type=type_,
                    district=district,
                    division=division,
                    lat=lat,
                    lng=lng,
                    verified=True,
                ))

        # Seed admin user
        from sqlalchemy import select
        result = await session.execute(
            select(User).where(User.email == "mahadi379377@gmail.com")
        )
        if not result.scalar_one_or_none():
            session.add(User(
                id=str(uuid.uuid4()),
                name="Mahadi (Admin)",
                email="mahadi379377@gmail.com",
                password_hash=hash_password("idahamsm@"),
                phone="01712345678",
                role="admin",
                rating_avg=5.0,
                rating_count=0,
            ))

        await session.commit()
        print("✅ Seed complete — institutes and admin user created.")


if __name__ == "__main__":
    asyncio.run(seed())
