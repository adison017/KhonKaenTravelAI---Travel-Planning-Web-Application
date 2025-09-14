import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plan, Activity, WeatherData, Stop } from "@/lib/storage";

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: number;
  plan: Plan | undefined;
  weather: WeatherData | undefined;
  formatDate: (dateStr: string, dayOffset: number) => string;
  startDate: string;
}

const DayDetailsModal = ({ 
  isOpen, 
  onClose, 
  day, 
  plan, 
  weather,
  formatDate,
  startDate
}: DayDetailsModalProps) => {
  const getWeatherIcon = (condition: string) => {
    if (condition.includes("แดด")) return "☀️";
    if (condition.includes("ฝน")) return "🌧️";
    if (condition.includes("เมฆ")) return "🌤️";
    return "🌤️";
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "ธรรมชาติ": return "🌿";
      case "อาหารท้องถิ่น": return "🍽️";
      case "วัฒนธรรม": return "🏛️";
      case "ช้อปปิ้ง": return "🛍️";
      default: return "📍";
    }
  };

  const formatTime = (time: string) => {
    return time.replace(":", " : ");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            📅 DAY {day} — {formatDate(startDate, day)}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Weather Section */}
            {weather && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-3">🌤️ สภาพอากาศ</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getWeatherIcon(weather.condition)}</span>
                      <div>
                        <p className="font-medium">{weather.condition}</p>
                        <p className="text-sm text-muted-foreground">สภาพอากาศ</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{weather.temp}°C</p>
                      <p className="text-sm text-muted-foreground">อุณหภูมิ</p>
                    </div>
                    <div>
                      <p className="font-medium">{weather.humidity}%</p>
                      <p className="text-sm text-muted-foreground">ความชื้น</p>
                    </div>
                    <div>
                      <p className="font-medium">{weather.wind} km/h</p>
                      <p className="text-sm text-muted-foreground">ลม</p>
                    </div>
                  </div>
                  {weather.forecast && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="font-medium">📢 คำแนะนำ:</p>
                      <p className="text-sm">{weather.forecast}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Transportation Section */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-3">🚗 การเดินทาง</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">จุดเริ่มต้น:</span>
                    <span>{plan?.startLocation || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">จุดสิ้นสุด:</span>
                    <span>{plan?.endLocation || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">พาหนะ:</span>
                    <span>{plan?.transportation || "-"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stops Section */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-3">📍 จุดแวะพัก</h3>
                {plan?.stops && plan.stops.length > 0 ? (
                  <div className="space-y-3">
                    {plan.stops.map((stop: Stop, index: number) => (
                      <div key={index} className="p-3 bg-secondary rounded-md">
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span className="font-medium">{stop.name}</span>
                        </div>
                        {(stop.timeStart || stop.timeEnd) && (
                          <div className="text-sm text-muted-foreground mt-1">
                            ⏰ {stop.timeStart} - {stop.timeEnd}
                          </div>
                        )}
                        {stop.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            ℹ️ {stop.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">ไม่มีจุดแวะพักที่กำหนด</p>
                )}
              </CardContent>
            </Card>

            {/* Accommodation Section */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-3">🏨 ที่พัก</h3>
                <p>{plan?.accommodation || "ยังไม่ได้กำหนดที่พัก"}</p>
              </CardContent>
            </Card>

            {/* Activities Section */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-3">🎯 กิจกรรม</h3>
                {plan?.activities && plan.activities.length > 0 ? (
                  <div className="space-y-4">
                    {plan.activities.map((activity: Activity, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getActivityIcon(activity.type)}</span>
                            <h4 className="font-semibold">{activity.title}</h4>
                          </div>
                          <Badge variant="secondary">{activity.type}</Badge>
                        </div>
                        
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <span>⏰</span>
                            <span>{formatTime(activity.timeStart)} - {formatTime(activity.timeEnd)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>💰</span>
                            <span>{activity.cost > 0 ? `${activity.cost} บาท` : "ฟรี"}</span>
                          </div>
                        </div>
                        
                        {activity.description && (
                          <p className="mt-2 text-sm text-muted-foreground">{activity.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">ยังไม่มีกิจกรรมที่กำหนด</p>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DayDetailsModal;