# 🗄️ Database Quick Reference

## Common Commands

```bash
# View database in browser
npm run db:studio

# Import ingredients from JSON
npm run db:import-ingredients

# Import recipes from JSON files
npm run db:import-recipes

# Create new admin user
npm run admin:create USERNAME PASSWORD

# Example: Create admin with custom credentials
npm run admin:create superadmin MySecurePass123
```

## API Testing

```bash
# Test recipe search
curl http://localhost:3000/api/recipes

# Test recipe detail
curl http://localhost:3000/api/recipes/hyderabadi-chicken-masala

# Test ingredient search
curl "http://localhost:3000/api/ingredients?search=chicken"

# Admin login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get all recipes (admin - needs token from login)
curl http://localhost:3000/api/admin/recipes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Database Connection

```bash
# Connection string in .env
DATABASE_URL="postgresql://niloy@localhost:5432/whattocook?schema=public"

# Connect via psql
psql -d whattocook

# Inside psql, check tables:
\dt

# Count ingredients:
SELECT COUNT(*) FROM ingredients;

# Count recipes:
SELECT COUNT(*) FROM recipes;
```

## File Structure

```
prisma/
├── schema.prisma          # Database schema definition

lib/
├── prisma.ts              # Prisma client singleton
├── adminAuth.ts           # Admin authentication
├── ingredients.json       # Original 1200 ingredients
└── recipes/               # Recipe JSON files
    └── *.json

app/api/
├── admin/
│   ├── login/             # POST /api/admin/login
│   ├── ingredients/       # CRUD for ingredients (admin only)
│   │   ├── route.ts       # GET, POST
│   │   └── [id]/route.ts  # GET, PUT, DELETE
│   └── recipes/           # CRUD for recipes (admin only)
│       ├── route.ts       # GET, POST
│       └── [id]/route.ts  # GET, PUT, DELETE
├── recipes/               # Public recipe endpoints
│   ├── route.ts           # GET /api/recipes (search)
│   └── [slug]/route.ts    # GET /api/recipes/[slug]
└── ingredients/           # Public ingredient search
    └── route.ts           # GET /api/ingredients

scripts/
├── createAdmin.ts         # Create admin users
├── migrateIngredientsToDb.ts   # Import ingredients
└── importRecipesToDb.ts   # Import recipes
```

## Troubleshooting

**"Module not found @/lib/prisma"**

- Make sure `tsconfig.json` has paths configured:
  ```json
  "paths": { "@/*": ["./*"] }
  ```

**"Database connection error"**

- Check PostgreSQL is running: `brew services list`
- Start if needed: `brew services start postgresql@14`
- Verify connection: `psql -d whattocook`

**"Prisma Client not generated"**

- Run: `npm run db:generate`

**"Table doesn't exist"**

- Push schema to database: `npm run db:push`
