
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FallOfWickets = ({ wickets = [], battingTeamName }) => {
  if (wickets.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Fall of Wickets - {battingTeamName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {wickets.map((wicket, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded border-l-4 border-red-500">
              <div className="flex-1">
                <div className="font-semibold text-red-800">
                  {wicket.runs}-{wicket.wicketNumber} ({wicket.overs} ov)
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">{wicket.player}</span>
                  <span className="ml-2 text-red-600">{wicket.dismissal}</span>
                </div>
              </div>
              <div className="text-right text-xs text-gray-500">
                Wicket #{wicket.wicketNumber}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FallOfWickets;
