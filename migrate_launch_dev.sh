yarn wait-on tcp:db:5432
echo "migrating"
yarn workspace data-resources pnpify prisma migrate deploy
echo "generating"
yarn workspace data-resources pnpify prisma generate
echo "seeding"
yarn workspace data-resources pnpify prisma db seed
echo "serving gateway"
yarn workspace backend-gateway server-dev