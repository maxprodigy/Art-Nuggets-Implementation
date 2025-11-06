#!/usr/bin/env python3
"""
Seed script to populate the database with courses for Art-Nuggets.
Run this script after ensuring industries and niches are created in the database.
"""

import asyncio
import uuid
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from sqlalchemy.orm import sessionmaker
from app.core.database import async_engine
from app.core.config import settings
from app.models.industry import Industry
from app.models.niche import Niche
from app.course.services import CourseService
from app.course.schemas import CourseCreateModel, KeyTakeawayCreate, AdditionalResourceCreate


# Course data with industries and niches
COURSES_DATA = [
    {
        "industry": "Visual Arts & Fine Art",
        "niche": "Hyperrealism painting",
        "title": "Mastering Hyperrealism: Painting Photographic Realism",
        "summary": "Learn advanced techniques to create paintings that capture every detail with photographic precision. This comprehensive course covers brush techniques, color mixing, layering methods, and how to work with references.",
        "video_link": "https://www.youtube.com/watch?v=hyperrealism_intro",
        "source": "Art Academy Pro",
        "key_takeaways": [
            "Master color matching and gradient techniques",
            "Learn to work with multiple reference photos",
            "Understand light and shadow in hyperrealistic context",
            "Develop patience and attention to micro-details",
            "Create your own hyperrealistic masterpiece"
        ],
        "additional_resources": [
            {"title": "Hyperrealism Reference Library", "link": "https://example.com/ref-lib"},
            {"title": "Color Theory Guide", "link": "https://example.com/color-theory"}
        ]
    },
    {
        "industry": "Visual Arts & Fine Art",
        "niche": "Botanical illustration",
        "title": "Botanical Art: Drawing Plants with Scientific Accuracy",
        "summary": "Discover the beautiful intersection of art and science as you learn to create detailed, accurate botanical illustrations. Perfect for artists, botanists, and nature enthusiasts.",
        "video_link": "https://www.youtube.com/watch?v=botanical_intro",
        "source": "Natural History Museum Workshops",
        "key_takeaways": [
            "Identify and capture plant characteristics accurately",
            "Master watercolor techniques for botanical art",
            "Understand scientific botanical terminology",
            "Develop observational drawing skills",
            "Create portfolio-ready botanical illustrations"
        ],
        "additional_resources": [
            {"title": "Botanical Specimen Database", "link": "https://example.com/botanicals"},
            {"title": "Recommended Art Supplies", "link": "https://example.com/supplies"}
        ]
    },
    {
        "industry": "Visual Arts & Fine Art",
        "niche": "Custom pet portraits",
        "title": "Pet Portrait Mastery: Capturing Animal Personalities",
        "summary": "Turn your love for animals into beautiful art. Learn techniques for drawing and painting pets with emotional depth and personality, whether in traditional or digital media.",
        "video_link": "https://www.youtube.com/watch?v=pet_portrait_intro",
        "source": "PetArt Studio",
        "key_takeaways": [
            "Capture animal expressions and personality",
            "Work with challenging reference photos",
            "Master fur texture techniques",
            "Understand animal anatomy for artists",
            "Build a profitable pet portrait business"
        ],
        "additional_resources": [
            {"title": "Pet Photography Tips", "link": "https://example.com/pet-photos"},
            {"title": "Commission Pricing Guide", "link": "https://example.com/pricing"}
        ]
    },
    {
        "industry": "Visual Arts & Fine Art",
        "niche": "Kinetic sculpture",
        "title": "Motion in Art: Creating Kinetic Sculptures",
        "summary": "Explore the dynamic world of kinetic art. Learn to design and build sculptures that move, balance, and interact with their environment through mechanical principles.",
        "video_link": "https://www.youtube.com/watch?v=kinetic_intro",
        "source": "Contemporary Art Institute",
        "key_takeaways": [
            "Understand basic mechanical principles for art",
            "Design balanced and mobile sculptures",
            "Work with various materials including metal and wood",
            "Integrate motors and natural forces",
            "Exhibit kinetic art professionally"
        ],
        "additional_resources": [
            {"title": "Kinetic Art Gallery Examples", "link": "https://example.com/kinetic-gallery"},
            {"title": "Material Suppliers", "link": "https://example.com/materials"}
        ]
    },
    {
        "industry": "Visual Arts & Fine Art",
        "niche": "Fine art jewelry design",
        "title": "Art Jewelry: Creating Wearable Sculptures",
        "summary": "Transform precious materials into expressive art jewelry. Learn advanced metalworking, stone setting, and design principles to create unique pieces that tell stories.",
        "video_link": "https://www.youtube.com/watch?v=art_jewelry_intro",
        "source": "Jewelry Arts Institute",
        "key_takeaways": [
            "Master traditional and contemporary techniques",
            "Design jewelry as narrative art",
            "Work with precious metals and stones safely",
            "Understand jewelry business and marketing",
            "Develop a signature artistic style"
        ],
        "additional_resources": [
            {"title": "Gemstone Reference Guide", "link": "https://example.com/gems"},
            {"title": "Tool Suppliers Directory", "link": "https://example.com/tools"}
        ]
    },
    {
        "industry": "Visual Arts & Fine Art",
        "niche": "Traditional Japanese tattoo style",
        "title": "Irezumi Tradition: Japanese Tattoo Art Fundamentals",
        "summary": "Study the rich history and techniques of traditional Japanese tattoo art (Irezumi). Learn composition, symbolism, color theory, and cultural context.",
        "video_link": "https://www.youtube.com/watch?v=japanese_tattoo_intro",
        "source": "Japanese Arts Foundation",
        "key_takeaways": [
            "Understand Japanese tattoo symbolism and history",
            "Master traditional motifs (dragons, koi, cherry blossoms)",
            "Learn proper composition for body flow",
            "Work with clients respectfully and professionally",
            "Develop portfolio for apprenticeship"
        ],
        "additional_resources": [
            {"title": "Symbolism Dictionary", "link": "https://example.com/symbols"},
            {"title": "Historical Reference Books", "link": "https://example.com/history"}
        ]
    },
    {
        "industry": "Design (Graphic, Product, Fashion, Architecture)",
        "niche": "Brand identity for sustainable businesses",
        "title": "Sustainable Branding: Eco-Conscious Visual Identity",
        "summary": "Create brand identities that authentically communicate sustainability values. Learn to design logos, color palettes, and visual systems that resonate with eco-conscious audiences.",
        "video_link": "https://www.youtube.com/watch?v=sustainable_branding_intro",
        "source": "Design for Good Agency",
        "key_takeaways": [
            "Communicate sustainability authentically in design",
            "Avoid greenwashing and develop genuine narratives",
            "Create cohesive brand systems",
            "Work with sustainable materials in design",
            "Build successful eco-brand portfolios"
        ],
        "additional_resources": [
            {"title": "Sustainable Materials Database", "link": "https://example.com/materials"},
            {"title": "Case Studies Library", "link": "https://example.com/cases"}
        ]
    },
    {
        "industry": "Design (Graphic, Product, Fashion, Architecture)",
        "niche": "Packaging design for craft beverages",
        "title": "Craft Beverage Packaging: Standing Out on Shelves",
        "summary": "Design packaging that tells the story of craft beers, wines, and spirits. Learn typography, illustration, and structural design for bottles, cans, and labels.",
        "video_link": "https://www.youtube.com/watch?v=craft_packaging_intro",
        "source": "Beverage Design Academy",
        "key_takeaways": [
            "Design for small-batch beverage brands",
            "Create compelling label designs",
            "Understand printing and production constraints",
            "Balance creativity with regulatory requirements",
            "Build relationships with craft beverage industry"
        ],
        "additional_resources": [
            {"title": "Print Specification Guide", "link": "https://example.com/print-specs"},
            {"title": "Label Material Options", "link": "https://example.com/labels"}
        ]
    },
    {
        "industry": "Design (Graphic, Product, Fashion, Architecture)",
        "niche": "UI/UX illustration",
        "title": "UI Illustration: Creating Engaging Digital Interfaces",
        "summary": "Master the art of illustration in user interfaces. Learn to create icons, spot illustrations, and visual elements that enhance user experience and brand identity.",
        "video_link": "https://www.youtube.com/watch?v=ui_illustration_intro",
        "source": "Digital Product Design School",
        "key_takeaways": [
            "Design illustrations that enhance UX",
            "Create consistent icon systems",
            "Work with design systems and style guides",
            "Master illustration tools (Figma, Illustrator)",
            "Collaborate effectively with developers"
        ],
        "additional_resources": [
            {"title": "Icon Resources Library", "link": "https://example.com/icons"},
            {"title": "Figma Plugins & Templates", "link": "https://example.com/figma"}
        ]
    },
    {
        "industry": "Design (Graphic, Product, Fashion, Architecture)",
        "niche": "Sustainable slow fashion",
        "title": "Slow Fashion Design: Ethical and Sustainable Apparel",
        "summary": "Design fashion collections with sustainability at their core. Learn to source ethical materials, create timeless designs, and build fashion brands that respect people and planet.",
        "video_link": "https://www.youtube.com/watch?v=slow_fashion_intro",
        "source": "Sustainable Fashion Institute",
        "key_takeaways": [
            "Source sustainable and ethical materials",
            "Design for durability and timeless style",
            "Understand garment construction and production",
            "Develop transparent supply chains",
            "Launch responsible fashion brands"
        ],
        "additional_resources": [
            {"title": "Sustainable Fabric Guide", "link": "https://example.com/fabrics"},
            {"title": "Certification Resources", "link": "https://example.com/certifications"}
        ]
    },
    {
        "industry": "Design (Graphic, Product, Fashion, Architecture)",
        "niche": "Medical device design",
        "title": "Medical Device Design: Safety and Innovation",
        "summary": "Design medical devices that are safe, effective, and user-friendly. Learn regulatory requirements, human factors engineering, and design for manufacturing.",
        "video_link": "https://www.youtube.com/watch?v=medical_design_intro",
        "source": "Biomedical Design Academy",
        "key_takeaways": [
            "Navigate FDA and regulatory requirements",
            "Apply human factors engineering principles",
            "Design for usability in medical settings",
            "Understand manufacturing constraints",
            "Prototype and test medical devices"
        ],
        "additional_resources": [
            {"title": "Regulatory Documentation Templates", "link": "https://example.com/regulatory"},
            {"title": "Medical Device Case Studies", "link": "https://example.com/case-studies"}
        ]
    },
    {
        "industry": "Design (Graphic, Product, Fashion, Architecture)",
        "niche": "Tiny home architecture",
        "title": "Tiny Home Design: Maximizing Small Spaces",
        "summary": "Master the art of designing beautiful, functional tiny homes. Learn space planning, off-grid systems, building codes, and sustainable construction methods.",
        "video_link": "https://www.youtube.com/watch?v=tiny_home_intro",
        "source": "Sustainable Architecture School",
        "key_takeaways": [
            "Design efficient and livable small spaces",
            "Integrate off-grid systems (solar, composting)",
            "Navigate building codes and zoning",
            "Work with modular construction methods",
            "Create sustainable tiny home communities"
        ],
        "additional_resources": [
            {"title": "Tiny Home Plans Library", "link": "https://example.com/plans"},
            {"title": "Off-Grid Systems Guide", "link": "https://example.com/off-grid"}
        ]
    },
    {
        "industry": "Media & Entertainment (Film, Gaming, Publishing)",
        "niche": "Independent documentary filmmaking",
        "title": "Indie Docs: Telling Truth Through Film",
        "summary": "Create compelling documentary films on your own terms. Learn pre-production, interviewing, cinematography, and editing for independent documentary projects.",
        "video_link": "https://www.youtube.com/watch?v=doc_filmmaking_intro",
        "source": "Independent Film Collective",
        "key_takeaways": [
            "Develop documentary story ideas and proposals",
            "Conduct effective interviews",
            "Master documentary cinematography",
            "Edit for narrative and emotional impact",
            "Distribute and exhibit independent documentaries"
        ],
        "additional_resources": [
            {"title": "Grant Writing for Films", "link": "https://example.com/grants"},
            {"title": "Documentary Festivals List", "link": "https://example.com/festivals"}
        ]
    },
    {
        "industry": "Media & Entertainment (Film, Gaming, Publishing)",
        "niche": "Stop-motion animation",
        "title": "Stop-Motion Magic: Bringing Objects to Life",
        "summary": "Master the time-consuming but rewarding art of stop-motion animation. Learn set building, puppet making, lighting, and frame-by-frame animation techniques.",
        "video_link": "https://www.youtube.com/watch?v=stopmotion_intro",
        "source": "Animation Academy",
        "key_takeaways": [
            "Build and light stop-motion sets",
            "Create and rig puppets",
            "Master frame-by-frame animation timing",
            "Use Dragonframe and other software",
            "Produce complete stop-motion projects"
        ],
        "additional_resources": [
            {"title": "Puppet Building Tutorials", "link": "https://example.com/puppets"},
            {"title": "Dragonframe Setup Guide", "link": "https://example.com/dragonframe"}
        ]
    },
    {
        "industry": "Media & Entertainment (Film, Gaming, Publishing)",
        "niche": "Concept art for video games",
        "title": "Game Concept Art: Visualizing Virtual Worlds",
        "summary": "Create stunning concept art for video games. Learn character design, environment painting, and world-building to bring game ideas to visual life.",
        "video_link": "https://www.youtube.com/watch?v=concept_art_intro",
        "source": "Game Art Institute",
        "key_takeaways": [
            "Design compelling game characters and creatures",
            "Create immersive game environments",
            "Work with art directors and game designers",
            "Master digital painting techniques",
            "Build game art portfolios"
        ],
        "additional_resources": [
            {"title": "Game Art Reference Library", "link": "https://example.com/game-refs"},
            {"title": "Industry Job Board", "link": "https://example.com/jobs"}
        ]
    },
    {
        "industry": "Media & Entertainment (Film, Gaming, Publishing)",
        "niche": "Narrative writing for interactive fiction",
        "title": "Interactive Fiction: Writing for Choice-Based Stories",
        "summary": "Write compelling narratives for interactive fiction games. Learn branching story structures, player agency, and how to implement stories using tools like Twine and Inky.",
        "video_link": "https://www.youtube.com/watch?v=interactive_fiction_intro",
        "source": "Interactive Fiction Writers Guild",
        "key_takeaways": [
            "Structure branching narratives effectively",
            "Balance player choice with authorial vision",
            "Use interactive fiction tools (Twine, Inky, Ren'Py)",
            "Write compelling dialogue and descriptions",
            "Publish and distribute interactive stories"
        ],
        "additional_resources": [
            {"title": "Twine Tutorial Series", "link": "https://example.com/twine"},
            {"title": "Interactive Fiction Archive", "link": "https://example.com/if-archive"}
        ]
    },
    {
        "industry": "Media & Entertainment (Film, Gaming, Publishing)",
        "niche": "Copywriting for health/wellness brands",
        "title": "Wellness Copywriting: Writing That Heals and Sells",
        "summary": "Master the art of writing copy for health and wellness brands. Learn to balance evidence-based messaging with emotional connection while respecting medical guidelines.",
        "video_link": "https://www.youtube.com/watch?v=wellness_copy_intro",
        "source": "Copywriting Mastery Institute",
        "key_takeaways": [
            "Write compliant health/wellness copy",
            "Balance emotional appeal with scientific accuracy",
            "Develop brand voice for wellness companies",
            "Understand FDA and FTC regulations",
            "Create campaigns that convert ethically"
        ],
        "additional_resources": [
            {"title": "Regulatory Compliance Checklist", "link": "https://example.com/compliance"},
            {"title": "Copywriting Templates", "link": "https://example.com/templates"}
        ]
    },
    {
        "industry": "Media & Entertainment (Film, Gaming, Publishing)",
        "niche": "E-book cover design for specific fiction genres",
        "title": "Genre Cover Design: Visual Storytelling for E-Books",
        "summary": "Design e-book covers that instantly communicate genre and hook readers. Learn typography, imagery, and color theory specific to romance, sci-fi, mystery, and other popular genres.",
        "video_link": "https://www.youtube.com/watch?v=ebook_covers_intro",
        "source": "Book Cover Design Studio",
        "key_takeaways": [
            "Design genre-appropriate covers",
            "Master e-book cover dimensions and formats",
            "Create compelling typography for titles",
            "Understand self-publishing platforms",
            "Build a client base of independent authors"
        ],
        "additional_resources": [
            {"title": "Genre Trends Dashboard", "link": "https://example.com/trends"},
            {"title": "Stock Photo Resources", "link": "https://example.com/stock"}
        ]
    },
    {
        "industry": "Performing Arts & Music",
        "niche": "Film scoring",
        "title": "Film Composition: Music That Tells Stories",
        "summary": "Learn to compose music that enhances cinematic storytelling. Study orchestration, harmony, and emotional pacing to create memorable film scores.",
        "video_link": "https://www.youtube.com/watch?v=film_scoring_intro",
        "source": "Music for Film Academy",
        "key_takeaways": [
            "Compose themes that support narrative",
            "Work with directors and editors",
            "Orchestrate for various ensembles",
            "Use technology (DAWs, virtual instruments)",
            "Navigate film industry as composer"
        ],
        "additional_resources": [
            {"title": "Orchestration Guide", "link": "https://example.com/orchestration"},
            {"title": "Film Composer Directory", "link": "https://example.com/composers"}
        ]
    },
    {
        "industry": "Performing Arts & Music",
        "niche": "Music production for niche genres",
        "title": "Lo-Fi Production: Creating Chill Music",
        "summary": "Master the lo-fi hip hop aesthetic: dusty samples, vinyl crackle, and laid-back beats. Learn production techniques, sampling, and sound design for niche genres.",
        "video_link": "https://www.youtube.com/watch?v=lofi_production_intro",
        "source": "Beat Academy",
        "key_takeaways": [
            "Create lo-fi hip hop beats",
            "Sample and manipulate audio creatively",
            "Design sound palettes and atmospheres",
            "Mix and master for streaming platforms",
            "Build audience in niche music communities"
        ],
        "additional_resources": [
            {"title": "Free Sample Pack Library", "link": "https://example.com/samples"},
            {"title": "Producer Tools & VSTs", "link": "https://example.com/vsts"}
        ]
    },
    {
        "industry": "Performing Arts & Music",
        "niche": "Music therapy",
        "title": "Therapeutic Music: Using Music to Heal",
        "summary": "Learn to use music therapeutically to support emotional, physical, and mental health. Study evidence-based practices and clinical applications.",
        "video_link": "https://www.youtube.com/watch?v=music_therapy_intro",
        "source": "Music Therapy Certification Board",
        "key_takeaways": [
            "Understand music therapy principles and ethics",
            "Work with diverse populations (children, seniors, trauma survivors)",
            "Apply evidence-based interventions",
            "Navigate certification and licensing",
            "Establish music therapy practice"
        ],
        "additional_resources": [
            {"title": "Research Database", "link": "https://example.com/research"},
            {"title": "Certification Requirements", "link": "https://example.com/cert"}
        ]
    },
    {
        "industry": "Performing Arts & Music",
        "niche": "Immersive theater production",
        "title": "Immersive Theater: Creating Participatory Experiences",
        "summary": "Design and produce theater experiences where audiences become part of the story. Learn environmental design, audience interaction, and site-specific production.",
        "video_link": "https://www.youtube.com/watch?v=immersive_theater_intro",
        "source": "Experimental Theater Collective",
        "key_takeaways": [
            "Design participatory theater experiences",
            "Work with non-traditional venues",
            "Create safe and engaging audience interactions",
            "Produce immersive events on budgets",
            "Collaborate in experimental theater communities"
        ],
        "additional_resources": [
            {"title": "Venue Database", "link": "https://example.com/venues"},
            {"title": "Production Budget Templates", "link": "https://example.com/budgets"}
        ]
    },
    {
        "industry": "Performing Arts & Music",
        "niche": "Historical costume restoration",
        "title": "Costume Conservation: Preserving Theatrical History",
        "summary": "Learn techniques for restoring and preserving historical theatrical costumes. Study textile conservation, period accuracy, and museum practices.",
        "video_link": "https://www.youtube.com/watch?v=costume_restoration_intro",
        "source": "Textile Conservation Institute",
        "key_takeaways": [
            "Assess and document costume condition",
            "Apply textile conservation techniques",
            "Research historical accuracy",
            "Work with museum collections",
            "Preserve costume history for future generations"
        ],
        "additional_resources": [
            {"title": "Historical Pattern Archive", "link": "https://example.com/patterns"},
            {"title": "Conservation Supply Catalog", "link": "https://example.com/supplies"}
        ]
    },
    {
        "industry": "Performing Arts & Music",
        "niche": "Lighting design for stage shows",
        "title": "Stage Lighting Design: Painting with Light",
        "summary": "Master the art of theatrical lighting design. Learn color theory, fixture types, programming, and how lighting shapes mood, space, and storytelling on stage.",
        "video_link": "https://www.youtube.com/watch?v=stage_lighting_intro",
        "source": "Theater Technology Institute",
        "key_takeaways": [
            "Design lighting plots and systems",
            "Program lighting consoles (ETC, GrandMA)",
            "Understand color science and optics",
            "Collaborate with directors and designers",
            "Work on professional theatrical productions"
        ],
        "additional_resources": [
            {"title": "Lighting Console Manuals", "link": "https://example.com/consoles"},
            {"title": "Color and Gel References", "link": "https://example.com/color"}
        ]
    },
    {
        "industry": "Crafts & Artisan Products",
        "niche": "Custom hand-dyed yarns",
        "title": "Hand-Dyeing Yarn: Creating One-of-a-Kind Fibers",
        "summary": "Learn to dye yarn by hand using various techniques including kettle dyeing, speckling, and gradient effects. Create unique colorways for fiber artists and knitters.",
        "video_link": "https://www.youtube.com/watch?v=hand_dyeing_intro",
        "source": "Fiber Arts Studio",
        "key_takeaways": [
            "Master various dyeing techniques",
            "Understand yarn fibers and dye uptake",
            "Create repeatable colorways",
            "Set up home dyeing studio safely",
            "Sell hand-dyed yarns successfully"
        ],
        "additional_resources": [
            {"title": "Dye Calculator Tool", "link": "https://example.com/calculator"},
            {"title": "Safety Guidelines", "link": "https://example.com/safety"}
        ]
    },
    {
        "industry": "Crafts & Artisan Products",
        "niche": "Ceramic functional art",
        "title": "Functional Ceramics: Beautiful and Usable Pottery",
        "summary": "Create pottery that is both beautiful and practical. Learn throwing, glazing, and firing techniques to produce functional ceramic art for daily use.",
        "video_link": "https://www.youtube.com/watch?v=functional_ceramics_intro",
        "source": "Clay Arts Academy",
        "key_takeaways": [
            "Throw consistent and functional forms",
            "Master glazing and surface decoration",
            "Understand firing processes and kiln operation",
            "Design for ergonomics and usability",
            "Sell ceramic work through galleries and markets"
        ],
        "additional_resources": [
            {"title": "Glaze Recipe Database", "link": "https://example.com/glazes"},
            {"title": "Studio Setup Guide", "link": "https://example.com/studio"}
        ]
    },
    {
        "industry": "Crafts & Artisan Products",
        "niche": "Unique woodworking/furniture",
        "title": "Artistic Woodworking: Furniture as Sculpture",
        "summary": "Design and build furniture that pushes artistic boundaries. Learn traditional joinery, bending wood techniques, and finishing methods to create heirloom pieces.",
        "video_link": "https://www.youtube.com/watch?v=woodworking_intro",
        "source": "Fine Woodworking Guild",
        "key_takeaways": [
            "Master traditional joinery techniques",
            "Design furniture with both form and function",
            "Work with various wood species",
            "Apply professional finishing methods",
            "Build custom furniture business"
        ],
        "additional_resources": [
            {"title": "Joinery Reference Library", "link": "https://example.com/joinery"},
            {"title": "Wood Species Guide", "link": "https://example.com/woods"}
        ]
    },
    {
        "industry": "Crafts & Artisan Products",
        "niche": "Macrame wall hangings",
        "title": "Macrame Mastery: Textile Art for Modern Spaces",
        "summary": "Create stunning wall hangings using ancient knotting techniques. Learn various knots, pattern design, and how to incorporate modern aesthetics into macrame.",
        "video_link": "https://www.youtube.com/watch?v=macrame_intro",
        "source": "Fiber Arts Collective",
        "key_takeaways": [
            "Master essential macrame knots",
            "Design and follow complex patterns",
            "Choose and work with different cord types",
            "Create large-scale installations",
            "Sell macrame art online and at markets"
        ],
        "additional_resources": [
            {"title": "Knot Tutorial Library", "link": "https://example.com/knots"},
            {"title": "Material Suppliers", "link": "https://example.com/materials"}
        ]
    },
]


async def get_or_create_industry(session: AsyncSession, industry_name: str) -> Industry:
    """Get existing industry or create if it doesn't exist"""
    statement = select(Industry).where(Industry.name == industry_name)
    result = await session.exec(statement)
    industry = result.first()
    
    if not industry:
        industry = Industry(name=industry_name)
        session.add(industry)
        await session.commit()
        await session.refresh(industry)
        print(f"✅ Created industry: {industry_name}")
    else:
        print(f"✓ Found existing industry: {industry_name}")
    
    return industry


async def get_or_create_niche(session: AsyncSession, niche_name: str, industry: Industry) -> Niche:
    """Get existing niche or create if it doesn't exist"""
    statement = select(Niche).where(
        Niche.name == niche_name,
        Niche.industry_id == industry.id
    )
    result = await session.exec(statement)
    niche = result.first()
    
    if not niche:
        niche = Niche(name=niche_name, industry_id=industry.id)
        session.add(niche)
        await session.commit()
        await session.refresh(niche)
        print(f"✅ Created niche: {niche_name}")
    else:
        print(f"✓ Found existing niche: {niche_name}")
    
    return niche


async def seed_courses():
    """Main function to seed courses"""
    print("🌱 Starting course seeding process...\n")
    
    # Create session
    Session = sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)
    async with Session() as session:
        try:
            course_service = CourseService()
            created_count = 0
            skipped_count = 0
            
            for course_data in COURSES_DATA:
                try:
                    # Get or create industry
                    industry = await get_or_create_industry(session, course_data["industry"])
                    
                    # Get or create niche
                    niche = await get_or_create_niche(session, course_data["niche"], industry)
                    
                    # Check if course already exists
                    from app.models.course import Course
                    statement = select(Course).where(
                        Course.title == course_data["title"],
                        Course.industry_id == industry.id
                    )
                    result = await session.exec(statement)
                    existing_course = result.first()
                    
                    if existing_course:
                        print(f"⏭️  Skipping existing course: {course_data['title']}")
                        skipped_count += 1
                        continue
                    
                    # Create course data model
                    key_takeaways = [KeyTakeawayCreate(content=takeaway) for takeaway in course_data["key_takeaways"]]
                    additional_resources = [
                        AdditionalResourceCreate(title=res["title"], link=res["link"])
                        for res in course_data.get("additional_resources", [])
                    ]
                    
                    course_create = CourseCreateModel(
                        title=course_data["title"],
                        industry_id=industry.id,
                        niche_id=niche.id,
                        video_link=course_data["video_link"],
                        summary=course_data["summary"],
                        source=course_data.get("source"),
                        key_takeaways=key_takeaways,
                        additional_resources=additional_resources
                    )
                    
                    # Create course using service
                    await course_service.create_course(course_create, session)
                    created_count += 1
                    print(f"✅ Created course: {course_data['title']}\n")
                    
                except Exception as e:
                    print(f"❌ Error creating course '{course_data['title']}': {e}\n")
                    continue
            
            print(f"\n🎉 Seeding complete!")
            print(f"   Created: {created_count} courses")
            print(f"   Skipped: {skipped_count} courses")
            
        except Exception as e:
            print(f"\n❌ Fatal error during seeding: {e}")
            import traceback
            traceback.print_exc()


if __name__ == "__main__":
    print("=" * 60)
    print("Art-Nuggets Course Seeding Script")
    print("=" * 60)
    print(f"Database: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else 'configured'}")
    print("=" * 60)
    print()
    
    asyncio.run(seed_courses())

