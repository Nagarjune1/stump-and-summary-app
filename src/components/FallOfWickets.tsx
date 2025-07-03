
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FallOfWickets = ({ wickets = [], battingTeamName }) => {
  if (wickets.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Fall of Wickets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {wickets.map((wicket, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded text-sm">
              <div className="flex-1">
                <span className="font-medium">{wicket.runs}-{wicket.wicketNumber}</span>
                <span className="text-gray-600 ml-2">({wicket.player}, {wicket.overs} ov)</span>
              </div>
              <div className="text-right text-xs text-gray-500">
                {wicket.dismissal}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FallOfWickets;
