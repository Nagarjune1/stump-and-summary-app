
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ExportReport = ({ 
  matchData, 
  scoreData, 
  currentBatsmen, 
  currentBowler, 
  innings1Score, 
  currentInnings, 
  winner,
  manOfMatch,
  manOfSeries,
  recentBalls = []
}) => {
  const [exporting, setExporting] = useState(false);

  const generateReport = () => {
    setExporting(true);
    
    // Create comprehensive match report
    const report = {
      matchInfo: {
        teams: `${matchData.team1?.name} vs ${matchData.team2?.name}`,
        venue: matchData.venue,
        date: matchData.match_date,
        format: matchData.format,
        overs: matchData.overs
      },
      innings1: {
        team: matchData.team1?.name,
        score: `${innings1Score.runs}/${innings1Score.wickets}`,
        overs: `${innings1Score.overs}.0`
      },
      innings2: currentInnings === 2 ? {
        team: matchData.team2?.name,
        score: `${scoreData.runs}/${scoreData.wickets}`,
        overs: `${scoreData.overs}.${scoreData.balls}`
      } : null,
      currentBatsmen: currentBatsmen.map(batsman => ({
        name: batsman.name,
        runs: batsman.runs || 0,
        balls: batsman.balls || 0,
        fours: batsman.fours || 0,
        sixes: batsman.sixes || 0,
        strikeRate: (batsman.balls || 0) > 0 ? (((batsman.runs || 0) / (batsman.balls || 0)) * 100).toFixed(1) : '0.0',
        isOut: batsman.isOut || false,
        dismissalType: batsman.dismissalType || null
      })),
      currentBowler: currentBowler ? {
        name: currentBowler.name,
        overs: currentBowler.overs || 0,
        runs: currentBowler.runs || 0,
        wickets: currentBowler.wickets || 0,
        economy: (currentBowler.overs || 0) > 0 ? ((currentBowler.runs || 0) / (currentBowler.overs || 0)).toFixed(1) : '0.0'
      } : null,
      recentBalls: recentBalls.slice(-12),
      result: winner,
      awards: {
        manOfMatch: manOfMatch?.name || null,
        manOfSeries: manOfSeries?.name || null
      }
    };

    // Generate downloadable content
    const content = JSON.stringify(report, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${matchData.team1?.name}_vs_${matchData.team2?.name}_match_report.json`;
    a.click();
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setExporting(false);
      toast({
        title: "Report Exported!",
        description: "Match report has been downloaded successfully",
      });
    }, 1000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Match Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Export complete match scorecard and statistics
          </p>
          <Button 
            onClick={generateReport} 
            disabled={exporting}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Generating...' : 'Download Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportReport;
