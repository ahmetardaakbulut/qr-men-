import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import QRCode from "qrcode";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create essential directories
const UPLOADS_DIR = path.join(__dirname, "uploads");
const QR_DIR = path.join(UPLOADS_DIR, "qr");
const DB_FILE = path.join(UPLOADS_DIR, "db.json");

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(QR_DIR)) fs.mkdirSync(QR_DIR, { recursive: true });

// Lazy initialization of Gemini client to prevent crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing in secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// Initial Database structure
interface Client {
  id: string;
  restaurant_name: string;
  logo: string;
  cover_image: string;
  phone: string;
  address: string;
  slug: string;
  theme: string;
  created_at: string;
}

interface Category {
  id: string;
  client_id: string;
  name: string;
  sort_order: number;
}

interface Product {
  id: string;
  client_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  ingredients: string;
  status: 'active' | 'passive';
  created_at: string;
}

interface Table {
  id: string;
  restaurant_id: string;
  table_number: string;
  qr_code: string;
  created_at: string;
}

interface DB {
  clients: Client[];
  categories: Category[];
  products: Product[];
  tables: Table[];
}

function readDB(): DB {
  if (!fs.existsSync(DB_FILE)) {
    const initialDB: DB = {
      clients: [
        {
          id: "c1",
          restaurant_name: "Karamelize Fast Food",
          logo: "🍔",
          cover_image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
          phone: "0555 123 4567",
          address: "Kadıköy, İstanbul",
          slug: "karamelize-fast-food",
          theme: "amber",
          created_at: new Date().toISOString()
        }
      ],
      categories: [
        { id: "cat1", client_id: "c1", name: "Klasik Burgerler", sort_order: 1 },
        { id: "cat2", client_id: "c1", name: "Nefis Yanlar", sort_order: 2 }
      ],
      products: [
        {
          id: "p1",
          client_id: "c1",
          category_id: "cat1",
          name: "Cheddar Bacon Burger",
          description: "Nefis dana köfte, bol eritilmiş cheddar peyniri, çıtır füme dana bacon ve karamelize soğan.",
          price: 240,
          image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
          ingredients: "Dana Köfte, Cheddar, Füme Bacon, Karamelize Soğan, Özel Sos",
          status: "active",
          created_at: new Date().toISOString()
        },
        {
          id: "p2",
          client_id: "c1",
          category_id: "cat1",
          name: "Tavuklu Avocado Burger",
          description: "Çıtır tavuk göğsü, taze avokado ezmesi, marul ve ev yapımı sarımsaklı mayonez sosu ile.",
          price: 195,
          image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80",
          ingredients: "Çıtır Tavuk, Avokado Ezmesi, Marul, Sarımsaklı Mayonez",
          status: "active",
          created_at: new Date().toISOString()
        },
        {
          id: "p3",
          client_id: "c1",
          category_id: "cat2",
          name: "Çıtır Patates Sepeti",
          description: "Baharatlı taze patates kızartması, yanında trüflü mayonez sos ile.",
          price: 85,
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80",
          ingredients: "Patates, Özel Baharat, Trüflü Mayonez",
          status: "active",
          created_at: new Date().toISOString()
        }
      ],
      tables: [
        {
          id: "t1",
          restaurant_id: "c1",
          table_number: "1",
          qr_code: "https://cloud9menu.ai/menu/karamelize-fast-food?masa=1",
          created_at: new Date().toISOString()
        },
        {
          id: "t2",
          restaurant_id: "c1",
          table_number: "2",
          qr_code: "https://cloud9menu.ai/menu/karamelize-fast-food?masa=2",
          created_at: new Date().toISOString()
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), "utf-8");
    return initialDB;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch (e) {
    console.error("Error reading db.json, returning empty template:", e);
    return { clients: [], categories: [], products: [], tables: [] };
  }
}

function writeDB(data: DB) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Serve uploads
  app.use("/uploads", express.static(UPLOADS_DIR));

  // --- API Routes ---

  // Get full DB state
  app.get("/api/db", (req, res) => {
    res.json(readDB());
  });

  // Clients REST
  app.post("/api/clients", (req, res) => {
    const { restaurant_name, logo, cover_image, phone, address, slug, theme } = req.body;
    if (!restaurant_name || !slug) {
      return res.status(400).json({ error: "Restoran adı ve slug zorunludur." });
    }

    const db = readDB();
    if (db.clients.some(c => c.slug === slug)) {
      return res.status(400).json({ error: "Bu URL adresi daha önce kullanılmış." });
    }

    const newClient: Client = {
      id: "cli_" + Math.random().toString(36).substring(2, 9),
      restaurant_name,
      logo: logo || "🍔",
      cover_image: cover_image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
      phone: phone || "",
      address: address || "",
      slug,
      theme: theme || "light",
      created_at: new Date().toISOString()
    };

    db.clients.push(newClient);
    writeDB(db);
    res.json(newClient);
  });

  app.put("/api/clients/:id", (req, res) => {
    const { id } = req.params;
    const { restaurant_name, logo, cover_image, phone, address, slug, theme } = req.body;

    const db = readDB();
    const idx = db.clients.findIndex(c => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Müşteri bulunamadı." });
    }

    // Check slug clash
    if (db.clients.some(c => c.slug === slug && c.id !== id)) {
      return res.status(400).json({ error: "Bu URL adresi başka bir restoran tarafından kullanılıyor." });
    }

    db.clients[idx] = {
      ...db.clients[idx],
      restaurant_name,
      logo,
      cover_image,
      phone,
      address,
      slug,
      theme
    };

    writeDB(db);
    res.json(db.clients[idx]);
  });

  app.delete("/api/clients/:id", (req, res) => {
    const { id } = req.params;
    const db = readDB();
    db.clients = db.clients.filter(c => c.id !== id);
    db.categories = db.categories.filter(cat => cat.client_id !== id);
    db.products = db.products.filter(p => p.client_id !== id);
    db.tables = db.tables.filter(t => t.restaurant_id !== id);
    writeDB(db);
    res.json({ success: true });
  });

  // Categories REST
  app.post("/api/categories", (req, res) => {
    const { client_id, name, sort_order } = req.body;
    if (!client_id || !name) {
      return res.status(400).json({ error: "Kategori adı ve restoran kimliği zorunludur." });
    }

    const db = readDB();
    const newCat: Category = {
      id: "cat_" + Math.random().toString(36).substring(2, 9),
      client_id,
      name,
      sort_order: Number(sort_order) || 0
    };

    db.categories.push(newCat);
    writeDB(db);
    res.json(newCat);
  });

  app.delete("/api/categories/:id", (req, res) => {
    const { id } = req.params;
    const db = readDB();
    db.categories = db.categories.filter(c => c.id !== id);
    // Delete products under that category
    db.products = db.products.filter(p => p.category_id !== id);
    writeDB(db);
    res.json({ success: true });
  });

  // Products REST
  app.post("/api/products", (req, res) => {
    const { client_id, category_id, name, description, price, image, ingredients, status } = req.body;
    if (!client_id || !category_id || !name || !price) {
      return res.status(400).json({ error: "Eksik ürün parametreleri." });
    }

    const db = readDB();
    const newProduct: Product = {
      id: "prod_" + Math.random().toString(36).substring(2, 9),
      client_id,
      category_id,
      name,
      description: description || "",
      price: Number(price),
      image: image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
      ingredients: ingredients || "",
      status: status || "active",
      created_at: new Date().toISOString()
    };

    db.products.push(newProduct);
    writeDB(db);
    res.json(newProduct);
  });

  app.put("/api/products/:id", (req, res) => {
    const { id } = req.params;
    const { name, description, price, image, ingredients, category_id, status } = req.body;

    const db = readDB();
    const idx = db.products.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Ürün bulunamadı." });
    }

    db.products[idx] = {
      ...db.products[idx],
      name,
      description,
      price: Number(price),
      image,
      ingredients,
      category_id,
      status
    };

    writeDB(db);
    res.json(db.products[idx]);
  });

  app.delete("/api/products/:id", (req, res) => {
    const { id } = req.params;
    const db = readDB();
    db.products = db.products.filter(p => p.id !== id);
    writeDB(db);
    res.json({ success: true });
  });

  // Tables REST
  app.post("/api/tables", (req, res) => {
    const { restaurant_id, table_number } = req.body;
    if (!restaurant_id || !table_number) {
      return res.status(400).json({ error: "Restoran ve masa numarası zorunludur." });
    }

    const db = readDB();
    const client = db.clients.find(c => c.id === restaurant_id);
    if (!client) {
      return res.status(404).json({ error: "Restoran bulunamadı." });
    }

    if (db.tables.some(t => t.restaurant_id === restaurant_id && t.table_number.toString() === table_number.toString())) {
      return res.status(400).json({ error: "Bu masa zaten tanımlanmış." });
    }

    const tableUrl = `https://cloud9menu.ai/menu/${client.slug}?masa=${table_number}`;
    const newTable: Table = {
      id: "tbl_" + Math.random().toString(36).substring(2, 9),
      restaurant_id,
      table_number: table_number.toString(),
      qr_code: tableUrl,
      created_at: new Date().toISOString()
    };

    db.tables.push(newTable);
    writeDB(db);
    res.json(newTable);
  });

  app.delete("/api/tables/:id", (req, res) => {
    const { id } = req.params;
    const db = readDB();
    db.tables = db.tables.filter(t => t.id !== id);
    writeDB(db);
    res.json({ success: true });
  });

  // --- Real-time server-side Gemini AI Chat ---
  app.post("/api/gemini/chat", async (req, res) => {
    const { restaurantName, menuItems, userPrompt } = req.body;

    if (!userPrompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    try {
      const clientAI = getGeminiClient();

      const itemsDescription = menuItems.map((item: any) => (
        `- Ürün Adı: ${item.name}, Fiyat: ₺${item.price}, Açıklama: ${item.description || "Yok"}, İçindekiler: ${item.ingredients || "Belirtilmemiş"}`
      )).join("\n");

      const systemInstruction = `
        Sen ${restaurantName} isimli restoranın cana yakın, profesyonel ve gurme Yapay Zeka (AI) Sipariş ve Menü Asistanısın.
        Görevin müşterinin sorularını tamamen aşağıdaki menü listesine bağlı kalarak yanıtlamak ve onlara harika önerilerde bulunmaktır.
        
        KURALLAR:
        1. SADECE aşağıdaki menüdeki ürünleri öner. Menüde olmayan bir ürünü asla uydurma veya önerme.
        2. Müşteri fiyat, gluten, alerjen veya içindekiler sorduğunda dürüst ve menüye uygun yanıt ver.
        3. Eğlenceli, iştah kabartıcı ve kibar bir ton kullan.
        4. Yanıtlarını kısa, scannable ve sade tut (mobil ekranda kolay okunması için).
        
        İŞTE RESTORAN MENÜSÜ:
        ${itemsDescription || "Şu an menüde hiç ürün bulunmamaktadır."}
      `;

      const response = await clientAI.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ reply: response.text });
    } catch (err: any) {
      console.error("Gemini AI Chat Error:", err);
      // Fallback response with clean local search if API key fails
      const query = userPrompt.toLowerCase();
      let matched = menuItems.filter((i: any) => 
        i.name.toLowerCase().includes(query) || 
        (i.description && i.description.toLowerCase().includes(query)) ||
        (i.ingredients && i.ingredients.toLowerCase().includes(query))
      );

      if (matched.length > 0) {
        const item = matched[0];
        res.json({
          reply: `[Demo Modu] Size menümüzden harika bir önerim var: ${item.name} (₺${item.price}). ${item.description || ""}. İçindekiler: ${item.ingredients || "Doğal malzemeler"}. Denemek ister misiniz?`
        });
      } else {
        res.json({
          reply: `Merhaba! ${restaurantName} asistanı olarak, size özel lezzet önerilerinde bulunmamı ister misiniz? Örneğin 'bize acısız ne önerirsin' veya 'en uygun fiyatlı ürünler neler' diye sorabilirsiniz.`
        });
      }
    }
  });

  // --- PHP-compatible /qr/generate.php simulation ---
  app.get("/qr/generate.php", async (req, res) => {
    const { url, format } = req.query;
    if (!url) {
      return res.status(400).send("Parameter 'url' is required.");
    }

    try {
      if (format === "svg") {
        const svgString = await QRCode.toString(url.toString(), {
          type: "svg",
          errorCorrectionLevel: "H"
        });
        res.setHeader("Content-Type", "image/svg+xml");
        return res.send(svgString);
      } else {
        const qrBuffer = await QRCode.toBuffer(url.toString(), {
          type: "png",
          errorCorrectionLevel: "H",
          width: 300
        });
        res.setHeader("Content-Type", "image/png");
        return res.send(qrBuffer);
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("QR Generation failed.");
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cloud9 Menu AI platform running on port ${PORT}`);
  });
}

startServer();
