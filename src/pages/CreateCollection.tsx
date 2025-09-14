import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, DollarSign, Tag, Sparkles, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import khonkaenHero from "@/assets/khonkaen-hero.jpg";

const CreateCollection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    startDate: "",
    endDate: "",
    budget: ""
  });

  const categories = [
    { value: "ครอบครัว", label: "ครอบครัว", icon: "🏺" },
    { value: "คู่รัก", label: "คู่รัก", icon: "💑" },
    { value: "เพื่อนฝูง", label: "เพื่อนฝูง", icon: "🧑‍🤝‍🧑" },
    { value: "คนเดียว", label: "คนเดียว", icon: "👤" },
    { value: "นักเรียน", label: "นักเรียน", icon: "🎓" }
  ];

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const totalDays = calculateDays(formData.startDate, formData.endDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.category || !formData.startDate || !formData.endDate || !formData.budget) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกข้อมูลให้ครบทุกช่อง",
        variant: "destructive"
      });
      return;
    }

    if (totalDays > 7) {
      toast({
        title: "ระยะเวลาเกินกำหนด",
        description: "ระบบรองรับการวางแผนไม่เกิน 7 วัน",
        variant: "destructive"
      });
      return;
    }

    const budget = parseInt(formData.budget);
    if (budget > 50000) {
      toast({
        title: "งบประมาณสูงเกินไป",
        description: "ระบบแนะนำงบประมาณไม่เกิน 50,000 บาท",
        variant: "destructive"
      });
    }

    // Generate collection ID and save to localStorage
    const collectionId = `ck${Date.now().toString(36)}`;
    const newCollection = {
      collectionId,
      name: formData.name,
      category: formData.category,
      startDate: formData.startDate,
      endDate: formData.endDate,
      budget: budget,
      weatherData: [], // Will be populated later
      plans: [
        {
          day: 1,
          startLocation: "",
          endLocation: "",
          transportation: "",
          accommodation: "",
          stops: [],
          activities: []
        }
      ]
    };

    // Save to localStorage using the correct key format
    const key = `collection_${collectionId}`;
    localStorage.setItem(key, JSON.stringify(newCollection));

    toast({
      title: "สร้างทริปสำเร็จ!",
      description: "กำลังนำคุณไปยังหน้าวางแผน",
      variant: "default"
    });

    // Navigate to plan manager
    setTimeout(() => {
      navigate(`/plan/${collectionId}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-khonkaen-secondary/30 to-khonkaen-nature/10 font-thai">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 animate-fade-in">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="hover:scale-105 transition-transform font-prompt">
              <ArrowLeft className="w-4 h-4" />
              ← กลับ
            </Button>
            <span className="text-3xl animate-float">🌿</span>
            <div>
              <h1 className="text-xl font-bold text-foreground font-kanit">KhonKaenTravelAI</h1>
              <p className="text-xs text-muted-foreground font-sarabun">วางแผนเที่ยวขอนแก่นอย่างชาญฉลาด</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative h-64 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url(${khonkaenHero})` }}
      >
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center text-center">
          <div className="animate-fade-in-up space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="w-6 h-6 text-white animate-float" />
              <Sparkles className="w-5 h-5 text-white animate-glow" />
            </div>
            <h2 className="text-3xl font-bold text-white font-kanit drop-shadow-lg">
              🎯 สร้างทริปใหม่สำหรับขอนแก่น
            </h2>
            <p className="text-lg text-white/90 font-sarabun drop-shadow-md">
              เริ่มต้นการผจญภัยที่น่าจดจำของคุณ
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Card className="shadow-xl border-border/50 bg-white/90 backdrop-blur-sm">
            <div className="h-2 bg-gradient-to-r from-khonkaen-primary via-khonkaen-warm to-khonkaen-nature"></div>
            <CardHeader>
              <CardTitle className="font-kanit text-2xl">ข้อมูลทริป</CardTitle>
              <CardDescription className="font-sarabun text-base">
                กรอกรายละเอียดทริปของคุณเพื่อเริ่มวางแผนการเดินทางที่สมบูรณ์แบบ
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Trip Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    📝 ชื่อทริป
                  </Label>
                  <Input
                    id="name"
                    placeholder="เช่น ทริปคู่รัก 2 วัน — ขอนแก่นโรแมนติก"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="text-base"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    🏷️ หมวดหมู่
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกหมวดหมู่ทริป" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <span className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span>{category.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="flex items-center gap-2">
                      📅 วันเริ่มต้น
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="flex items-center gap-2">
                      📅 วันสิ้นสุด
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Days calculation */}
                {totalDays > 0 && (
                  <div className="text-center p-3 bg-khonkaen-secondary/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      ระยะเวลา: <span className="font-semibold text-foreground">{totalDays} วัน</span>
                      {totalDays > 7 && (
                        <span className="text-destructive ml-2">(เกิน 7 วัน)</span>
                      )}
                    </p>
                  </div>
                )}

                {/* Budget */}
                <div className="space-y-2">
                  <Label htmlFor="budget" className="flex items-center gap-2">
                    💰 งบประมาณทั้งหมด (บาท)
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="เช่น 9000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    min="0"
                    max="100000"
                    className="text-base"
                  />
                  {formData.budget && parseInt(formData.budget) > 50000 && (
                    <p className="text-sm text-warning">
                      ⚠️ งบประมาณสูง — ระบบแนะนำไม่เกิน 50,000 บาท
                    </p>
                  )}
                </div>

                {/* Info */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    ℹ️ หมายเหตุ: ระบบจะโหลดสภาพอากาศอัตโนมัติจาก API ตามวันที่ที่ระบุ
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/dashboard')}
                    className="flex-1"
                  >
                    ยกเลิก
                  </Button>
                  <Button 
                    type="submit" 
                    variant="hero" 
                    className="flex-1"
                    disabled={!formData.name || !formData.category || !formData.startDate || !formData.endDate || !formData.budget || totalDays > 7}
                  >
                    ถัดไป — สร้างและเริ่ม Plan Day 1
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="mt-6 bg-khonkaen-secondary/30 border-khonkaen-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                💡 เคล็ดลับ: งบประมาณเฉลี่ยต่อวัน 1,500–2,500 บาทเหมาะกับทริปขอนแก่น
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateCollection;