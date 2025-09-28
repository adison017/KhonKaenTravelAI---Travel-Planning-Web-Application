import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, ShoppingBag, Star, MapPin, ExternalLink, RefreshCw } from "lucide-react";
import { searchLazadaProducts, generateKhonKaenProductIdeas, LazadaProduct } from "@/lib/lazadaApi";

const ProductRecommendations = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<LazadaProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [productKeywords, setProductKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState("");

  // Generate AI product ideas on component mount
  useEffect(() => {
    generateProductIdeas();
  }, []);

  const generateProductIdeas = async () => {
    setIsGeneratingIdeas(true);
    try {
      console.log('Generating product ideas for Khon Kaen...');
      const keywords = await generateKhonKaenProductIdeas();
      setProductKeywords(keywords);
      console.log('Generated keywords:', keywords);

      // Start with the first keyword
      if (keywords.length > 0) {
        setCurrentKeyword(keywords[0]);
        await searchProducts(keywords[0]);
      }
    } catch (error) {
      console.error('Error generating product ideas:', error);
      // Fallback keywords
      const fallbackKeywords = [
        "ของฝากขอนแก่น",
        "โซบะเงี้ยวขอนแก่น",
        "น้ำพริกขอนแก่น",
        "ผ้าทอขอนแก่น"
      ];
      setProductKeywords(fallbackKeywords);
      if (fallbackKeywords.length > 0) {
        setCurrentKeyword(fallbackKeywords[0]);
        await searchProducts(fallbackKeywords[0]);
      }
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const searchProducts = async (keyword: string) => {
    setIsSearching(true);
    setCurrentKeyword(keyword);
    try {
      console.log(`Searching for products: ${keyword}`);
      const results = await searchLazadaProducts(keyword);
      setProducts(results.data.items || []);
      console.log(`Found ${results.data.items?.length || 0} products for ${keyword}`);
    } catch (error) {
      console.error('Error searching products:', error);
      setProducts([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeywordClick = async (keyword: string) => {
    await searchProducts(keyword);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setProductKeywords([]); // Clear AI keywords when user searches manually
    await searchProducts(searchTerm.trim());
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return numPrice.toLocaleString('th-TH');
  };

  const getReviewStars = (rating: string) => {
    const stars = Math.round(parseFloat(rating));
    return '⭐'.repeat(stars);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-khonkaen-secondary/30 to-khonkaen-nature/10 font-thai">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="hover:scale-105 transition-transform"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3 animate-fade-in">
                <span className="text-3xl animate-float">🛒</span>
                <div>
                  <h1 className="text-2xl font-bold text-foreground font-kanit">สินค้าแนะนำสำหรับเที่ยวขอนแก่น</h1>
                  <p className="text-xs text-muted-foreground font-sarabun">อุปกรณ์เดินทางและของที่ระลึกสำหรับนักท่องเที่ยว</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="container mx-auto px-4 py-8">
        <Card className="mb-6 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="ค้นหาสินค้าที่ต้องการ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="font-sarabun"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchTerm.trim()}
                className="font-prompt bg-khonkaen-nature hover:bg-khonkaen-nature/90"
              >
                <Search className="w-4 h-4" />
                {isSearching ? 'กำลังค้นหา...' : 'ค้นหา'}
              </Button>
              <Button
                onClick={generateProductIdeas}
                disabled={isGeneratingIdeas}
                variant="outline"
                className="font-prompt"
              >
                <RefreshCw className={`w-4 h-4 ${isGeneratingIdeas ? 'animate-spin' : ''}`} />
                AI แนะนำ
              </Button>
            </div>

            {/* AI Generated Keywords */}
            {productKeywords.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground font-prompt">
                  📝 คำค้นหาที่ AI แนะนำ:
                </p>
                <div className="flex flex-wrap gap-2">
                  {productKeywords.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant={currentKeyword === keyword ? "default" : "outline"}
                      className={`cursor-pointer font-prompt transition-all ${
                        currentKeyword === keyword
                          ? 'bg-khonkaen-nature hover:bg-khonkaen-nature/90'
                          : 'hover:bg-khonkaen-nature/10'
                      }`}
                      onClick={() => handleKeywordClick(keyword)}
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Current Search Info */}
            {currentKeyword && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-prompt">
                  🔍 กำลังแสดงผลการค้นหาสำหรับ: <strong>"{currentKeyword}"</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {isSearching || isGeneratingIdeas ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 animate-spin">🔄</div>
              <h3 className="text-2xl font-bold text-foreground font-kanit mb-2">
                {isGeneratingIdeas ? 'AI กำลังคิดค้นสินค้า...' : 'กำลังค้นหาสินค้า'}
              </h3>
              <p className="text-muted-foreground font-sarabun">กรุณารอสักครู่...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, index) => (
                <Card
                  key={product.item_id}
                  className="group shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-border/50 bg-white/80 backdrop-blur-sm animate-fade-in overflow-hidden cursor-pointer"
                  style={{ animationDelay: `${0.1 * index}s` }}
                  onClick={() => window.open(product.product_url, '_blank')}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.img}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-kanit text-gray-800 line-clamp-2">
                      <ShoppingBag className="w-4 h-4 flex-shrink-0" />
                      {product.title}
                    </CardTitle>
                    <CardDescription className="text-sm font-sarabun line-clamp-2">
                      {product.shop_info.shop_name}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">
                          RM {formatPrice(product.price)}
                        </span>
                        {product.price_info.origin_price && product.price_info.origin_price !== product.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            RM {formatPrice(product.price_info.origin_price)}
                          </span>
                        )}
                      </div>
                      {product.is_ad && (
                        <Badge variant="secondary" className="text-xs">AD</Badge>
                      )}
                    </div>

                    {product.review_info && product.review_info.review_count > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <span>{getReviewStars(product.review_info.average_score)}</span>
                        <span className="text-muted-foreground">
                          ({product.review_info.review_count})
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{product.delivery_info.area_from}</span>
                      </div>
                      {product.sold_count && (
                        <span>ขายแล้ว {product.sold_count}</span>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full font-prompt bg-green-500 hover:bg-green-600 text-white border-green-500 flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(product.product_url, '_blank');
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      ดูสินค้า
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 animate-float">🔍</div>
              <h3 className="text-2xl font-bold text-foreground font-kanit mb-2">
                {currentKeyword ? `ไม่พบสินค้า "${currentKeyword}"` : "ยังไม่ได้เลือกคำค้นหา"}
              </h3>
              <p className="text-muted-foreground font-sarabun mb-6">
                {currentKeyword ? "ลองค้นหาด้วยคำอื่น หรือคลิก 'AI แนะนำ' เพื่อให้ AI คิดค้นสินค้าใหม่" : "คลิก 'AI แนะนำ' เพื่อให้ AI คิดค้นสินค้าที่น่าสนใจ"}
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={generateProductIdeas}
                  disabled={isGeneratingIdeas}
                  className="font-prompt"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isGeneratingIdeas ? 'animate-spin' : ''}`} />
                  AI แนะนำสินค้า
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tips Section */}
      <section className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-khonkaen-secondary/30 via-white/50 to-khonkaen-nature/20 border-khonkaen-primary/20 shadow-lg backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-3xl mb-2">🎒</div>
                <h4 className="font-semibold font-kanit text-foreground">อุปกรณ์เดินทาง</h4>
                <p className="text-sm text-muted-foreground font-sarabun">
                  อุปกรณ์และเครื่องแต่งกายสำหรับการท่องเที่ยว
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl mb-2">🤖</div>
                <h4 className="font-semibold font-kanit text-foreground">AI แนะนำ</h4>
                <p className="text-sm text-muted-foreground font-sarabun">
                  ค้นหาสินค้าสำหรับเที่ยวด้วยเทคโนโลยี AI
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl mb-2">🏔️</div>
                <h4 className="font-semibold font-kanit text-foreground">พร้อมสำหรับการผจญภัย</h4>
                <p className="text-sm text-muted-foreground font-sarabun">
                  อุปกรณ์ครบครันสำหรับเที่ยวขอนแก่น
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default ProductRecommendations;