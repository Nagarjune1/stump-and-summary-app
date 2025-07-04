
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Image, FileJson, Share } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ExportReport = ({ 
  matchData, 
  scoreData = { runs: 0, wickets: 0, overs: 0, balls: 0 }, 
  currentBatsmen = [], 
  currentBowler = null, 
  innings1Score = { runs: 0, wickets: 0, overs: 0 }, 
  currentInnings = 1, 
  winner = null,
  manOfMatch = null,
  manOfSeries = null,
  recentBalls = [],
  allPlayers = []
}) => {
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState("json");

  const generateMatchReport = () => {
    if (!matchData) {
      return {
        matchInfo: {
          title: "Match Report",
          venue: "Unknown",
          date: new Date().toISOString().split('T')[0],
          format: "T20",
          overs: 20,
          result: winner || "Match in progress"
        },
        toss: {
          winner: "Not specified",
          decision: "Not specified"
        },
        innings: {
          first: {
            team: "Team 1",
            score: `${innings1Score.runs}/${innings1Score.wickets}`,
            overs: `${innings1Score.overs}.0`,
            runRate: innings1Score.overs > 0 ? (innings1Score.runs / innings1Score.overs).toFixed(2) : '0.00'
          },
          second: currentInnings === 2 ? {
            team: "Team 2",
            score: `${scoreData.runs}/${scoreData.wickets}`,
            overs: `${scoreData.overs}.${scoreData.balls || 0}`,
            runRate: (scoreData.overs + (scoreData.balls || 0) / 6) > 0 ? 
              (scoreData.runs / (scoreData.overs + (scoreData.balls || 0) / 6)).toFixed(2) : '0.00'
          } : null
        },
        performance: {
          currentBatsmen: currentBatsmen.map(batsman => ({
            name: batsman.name || 'Unknown',
            runs: batsman.runs || 0,
            balls: batsman.balls || 0,
            fours: batsman.fours || 0,
            sixes: batsman.sixes || 0,
            strikeRate: (batsman.balls || 0) > 0 ? 
              (((batsman.runs || 0) / (batsman.balls || 0)) * 100).toFixed(1) : '0.0'
          })),
          currentBowler: currentBowler ? {
            name: currentBowler.name || 'Unknown',
            overs: currentBowler.overs || 0,
            runs: currentBowler.runs || 0,
            wickets: currentBowler.wickets || 0,
            economy: (currentBowler.overs || 0) > 0 ? 
              ((currentBowler.runs || 0) / (currentBowler.overs || 0)).toFixed(1) : '0.0'
          } : null
        },
        recentBalls: recentBalls.slice(-12),
        awards: {
          manOfMatch: manOfMatch?.name || null,
          manOfSeries: manOfSeries?.name || null
        },
        summary: generateMatchSummary()
      };
    }

    const report = {
      matchInfo: {
        title: `${matchData.team1?.name || 'Team 1'} vs ${matchData.team2?.name || 'Team 2'}`,
        venue: matchData.venue || 'Unknown Venue',
        date: matchData.match_date || new Date().toISOString().split('T')[0],
        format: matchData.format || 'T20',
        overs: matchData.overs || 20,
        result: winner || matchData.result || 'Match in progress'
      },
      toss: {
        winner: matchData.toss_winner || 'Not specified',
        decision: matchData.toss_decision || 'Not specified'
      },
      innings: {
        first: {
          team: matchData.team1?.name || 'Team 1',
          score: `${innings1Score.runs}/${innings1Score.wickets}`,
          overs: `${innings1Score.overs}.0`,
          runRate: innings1Score.overs > 0 ? (innings1Score.runs / innings1Score.overs).toFixed(2) : '0.00'
        },
        second: currentInnings === 2 ? {
          team: matchData.team2?.name || 'Team 2',
          score: `${scoreData.runs}/${scoreData.wickets}`,
          overs: `${scoreData.overs}.${scoreData.balls || 0}`,
          runRate: (scoreData.overs + (scoreData.balls || 0) / 6) > 0 ? 
            (scoreData.runs / (scoreData.overs + (scoreData.balls || 0) / 6)).toFixed(2) : '0.00'
        } : null
      },
      performance: {
        currentBatsmen: (allPlayers.length > 0 ? allPlayers.filter(p => p.runs !== undefined) : currentBatsmen).map(batsman => ({
          name: batsman.name || 'Unknown',
          runs: batsman.runs || 0,
          balls: batsman.balls || 0,
          fours: batsman.fours || 0,
          sixes: batsman.sixes || 0,
          strikeRate: (batsman.balls || 0) > 0 ? 
            (((batsman.runs || 0) / (batsman.balls || 0)) * 100).toFixed(1) : '0.0'
        })),
        currentBowler: currentBowler ? {
          name: currentBowler.name || 'Unknown',
          overs: currentBowler.overs || 0,
          runs: currentBowler.runs || 0,
          wickets: currentBowler.wickets || 0,
          economy: (currentBowler.overs || 0) > 0 ? 
            ((currentBowler.runs || 0) / (currentBowler.overs || 0)).toFixed(1) : '0.0'
        } : null,
        bowlers: allPlayers.filter(p => p.overs !== undefined && p.overs > 0).map(bowler => ({
          name: bowler.name || 'Unknown',
          overs: bowler.overs || 0,
          runs: bowler.runs || 0,
          wickets: bowler.wickets || 0,
          economy: (bowler.overs || 0) > 0 ? 
            ((bowler.runs || 0) / (bowler.overs || 0)).toFixed(1) : '0.0'
        }))
      },
      recentBalls: recentBalls.slice(-12),
      awards: {
        manOfMatch: manOfMatch?.name || null,
        manOfSeries: manOfSeries?.name || null
      },
      summary: generateMatchSummary()
    };

    return report;
  };

  const generateMatchSummary = () => {
    if (!winner && !matchData?.result) return "Match in progress";
    
    const result = winner || matchData?.result || "Match completed";
    let summary = result;
    
    if (currentBatsmen.length > 0) {
      const topScorer = currentBatsmen.reduce((top, batsman) => 
        (batsman.runs || 0) > (top.runs || 0) ? batsman : top, currentBatsmen[0] || {});
      
      if (topScorer.name && topScorer.runs > 0) {
        summary += `. ${topScorer.name} top scored with ${topScorer.runs || 0}(${topScorer.balls || 0}).`;
      }
    }
    
    if (currentBowler && currentBowler.wickets > 0) {
      summary += ` ${currentBowler.name} took ${currentBowler.wickets} wickets.`;
    }
    
    return summary;
  };

  const exportAsJSON = (report) => {
    const content = JSON.stringify(report, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${matchData.team1?.name}_vs_${matchData.team2?.name}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = (report) => {
    const csvData = [
      ['Match Info', ''],
      ['Teams', `${report.matchInfo.title}`],
      ['Venue', report.matchInfo.venue],
      ['Date', report.matchInfo.date],
      ['Result', report.matchInfo.result || 'In Progress'],
      ['', ''],
      ['Innings 1', ''],
      ['Team', report.innings.first.team],
      ['Score', report.innings.first.score],
      ['Overs', report.innings.first.overs],
      ['Run Rate', report.innings.first.runRate],
    ];

    if (report.innings.second) {
      csvData.push(
        ['', ''],
        ['Innings 2', ''],
        ['Team', report.innings.second.team],
        ['Score', report.innings.second.score],
        ['Overs', report.innings.second.overs],
        ['Run Rate', report.innings.second.runRate]
      );
    }

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${matchData.team1?.name}_vs_${matchData.team2?.name}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsText = (report) => {
    const textContent = `
CRICKET MATCH REPORT
===================

${report.matchInfo.title}
Venue: ${report.matchInfo.venue}
Date: ${report.matchInfo.date}
Format: ${report.matchInfo.format}

TOSS
----
${report.toss.winner} won the toss and ${report.toss.decision}

SCORECARD
---------
${report.innings.first.team}: ${report.innings.first.score} (${report.innings.first.overs} overs)
Run Rate: ${report.innings.first.runRate}

${report.innings.second ? `
${report.innings.second.team}: ${report.innings.second.score} (${report.innings.second.overs} overs)
Run Rate: ${report.innings.second.runRate}
` : ''}

RESULT
------
${report.matchInfo.result || 'Match in progress'}

SUMMARY
-------
${report.summary}

${report.awards.manOfMatch ? `Man of the Match: ${report.awards.manOfMatch}` : ''}
${report.awards.manOfSeries ? `Man of the Series: ${report.awards.manOfSeries}` : ''}

Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${matchData.team1?.name}_vs_${matchData.team2?.name}_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    setExporting(true);
    
    try {
      const report = generateMatchReport();
      
      switch (exportFormat) {
        case 'json':
          exportAsJSON(report);
          break;
        case 'csv':
          exportAsCSV(report);
          break;
        case 'txt':
          exportAsText(report);
          break;
        default:
          exportAsJSON(report);
      }
      
      toast({
        title: "Export Successful!",
        description: `Match report exported as ${exportFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the report",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => setExporting(false), 1000);
    }
  };

  const shareReport = async () => {
    try {
      const report = generateMatchReport();
      const shareText = `${report.matchInfo.title}
${report.matchInfo.result || 'Match in progress'}
${report.summary}`;

      if (navigator.share) {
        await navigator.share({
          title: `Cricket Match: ${report.matchInfo.title}`,
          text: shareText,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to Clipboard!",
          description: "Match summary copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Share Failed",
        description: "Unable to share the report",
        variant: "destructive"
      });
    }
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
          
          <div>
            <label className="block text-sm font-medium mb-2">Export Format</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileJson className="w-4 h-4" />
                    JSON (Detailed)
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    CSV (Spreadsheet)
                  </div>
                </SelectItem>
                <SelectItem value="txt">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Text (Summary)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleExport} 
              disabled={exporting}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting ? 'Exporting...' : 'Download'}
            </Button>
            
            <Button 
              onClick={shareReport}
              variant="outline"
              className="flex-1"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportReport;
