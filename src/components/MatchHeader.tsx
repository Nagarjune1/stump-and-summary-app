
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Clock, Users } from "lucide-react";

const MatchHeader = ({ matchData, tossInfo, playingXI }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return null;
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="bg-gradient-to-r from-blue-900 via-blue-800 to-green-900 text-white">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl md:text-2xl mb-2">
              {matchData.team1?.name} vs {matchData.team2?.name}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(matchData.match_date)}
              </div>
              {matchData.match_time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(matchData.match_time)}
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {matchData.venue}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-500 animate-pulse">LIVE</Badge>
            <Badge variant="outline" className="text-white border-white">
              {matchData.format}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      {(tossInfo || matchData.tournament) && (
        <CardContent className="pt-0">
          <Separator className="mb-3 bg-white/20" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {tossInfo && (
              <div>
                <span className="font-semibold">Toss:</span> {tossInfo}
              </div>
            )}
            {matchData.tournament && (
              <div>
                <span className="font-semibold">Tournament:</span> {matchData.tournament}
              </div>
            )}
            {matchData.overs && (
              <div>
                <span className="font-semibold">Format:</span> {matchData.overs} overs per side
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default MatchHeader;
