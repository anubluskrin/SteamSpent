-- CreateTable
CREATE TABLE "games" (
    "appid" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "discount_price" DECIMAL(65,30),
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "is_free" BOOLEAN NOT NULL DEFAULT false,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "games_pkey" PRIMARY KEY ("appid")
);

-- CreateTable
CREATE TABLE "search_logs" (
    "id" SERIAL NOT NULL,
    "steamid64" TEXT NOT NULL,
    "vanity_name" TEXT,
    "total_price" DECIMAL(65,30) NOT NULL,
    "searched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_logs_pkey" PRIMARY KEY ("id")
);
