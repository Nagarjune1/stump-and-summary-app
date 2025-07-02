
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, FileDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ExportReport = ({ matchData, scoreData, currentBatsmen, currentBowler, innings1Score, currentInnings, winner }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState("json");

  const generateReport = () => {
    const reportData = {
      match: {
        id: matchData.id,
        teams: `${matchData.team1?.name || 'Team 1'} vs ${matchData.team2?.name || 'Team 2'}`,
        venue: matchData.venue,
        format: matchData.format,
        date: matchData.match_date,
        status: 'completed'
      },
      score: {
        innings1: innings1Score,
        innings2: currentInnings === 2 ? scoreData : null,
        winner: winner
      },
      players: {
        batsmen: currentBatsmen.map(b => ({
          name: b.name,
          runs: b.runs || 0,
          balls: b.balls || 0,
          fours: b.fours || 0,
          sixes: b.sixes || 0,
          strikeRate: b.balls ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0',
          lastShot: b.lastShot
        })),
        bowler: currentBowler ? {
          name: currentBowler.name,
          overs: currentBowler.overs || 0,
          runs: currentBowler.runs || 0,
          wickets: currentBowler.wickets || 0,
          economy: currentBowler.overs ? (currentBowler.runs / currentBowler.overs).toFixed(1) : '0.0'
        } : null
      },
      timestamp: new Date().toISOString()
    };

    if (format === "json") {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cricket-match-report-${matchData.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === "csv") {
      const csvContent = [
        "Match Report",
        `Teams,${reportData.match.teams}`,
        `Venue,${reportData.match.venue}`,
        `Date,${reportData.match.date}`,
        `Winner,${reportData.score.winner || 'N/A'}`,
        "",
        "Batsmen Performance",
        "Name,Runs,Balls,4s,6s,Strike Rate,Last Shot",
        ...reportData.players.batsmen.map(b => 
          `${b.name},${b.runs},${b.balls},${b.fours},${b.sixes},${b.strikeRate},${b.lastShot || 'N/A'}`
        ),
        "",
        "Bowling Performance",
        "Name,Overs,Runs,Wickets,Economy",
        reportData.players.bowler ? 
          `${reportData.players.bowler.name},${reportData.players.bowler.overs},${reportData.players.bowler.runs},${reportData.players.bowler.wickets},${reportData.players.bowler.economy}` :
          "No bowler data"
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cricket-match-report-${matchData.id}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    toast({
      title: "Report Downloaded",
      description: `Match report exported as ${format.toUpperCase()}`,
    });

    setIsOpen(false);
  };

  const generatePDF = async () => {
    try {
      // Create HTML content for PDF
      const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cricket Match Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .winner { background-color: #fff3cd; border: 2px solid #ffc107; padding: 15px; margin: 20px 0; text-align: center; font-weight: bold; font-size: 18px; }
            .score-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; background-color: #f8f9fa; }
            .players-section { margin: 20px 0; }
            .table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .table th { background-color: #e9ecef; font-weight: bold; }
            .table tr:nth-child(even) { background-color: #f8f9fa; }
            .highlight { background-color: #d4edda; }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
            .stat-card { border: 1px solid #ddd; padding: 15px; text-align: center; background-color: #f8f9fa; }
            .stat-number { font-size: 24px; font-weight: bold; color: #007bff; }
            .stat-label { font-size: 14px; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Cricket Match Report</h1>
            <h2>${matchData.team1?.name || 'Team 1'} vs ${matchData.team2?.name || 'Team 2'}</h2>
            <p><strong>Venue:</strong> ${matchData.venue}</p>
            <p><strong>Format:</strong> ${matchData.format}</p>
            <p><strong>Date:</strong> ${new Date(matchData.match_date).toLocaleDateString()}</p>
          </div>
          
          ${winner ? `
            <div class="winner">
              🏆 ${winner}
            </div>
          ` : ''}
          
          <div class="score-section">
            <h3>Match Summary</h3>
            <div class="stats">
              ${innings1Score ? `
                <div class="stat-card">
                  <div class="stat-number">${innings1Score.runs}/${innings1Score.wickets}</div>
                  <div class="stat-label">Innings 1 Score</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${innings1Score.overs}</div>
                  <div class="stat-label">Innings 1 Overs</div>
                </div>
              ` : ''}
              ${currentInnings === 2 ? `
                <div class="stat-card">
                  <div class="stat-number">${scoreData.runs}/${scoreData.wickets}</div>
                  <div class="stat-label">Innings 2 Score</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${scoreData.overs}.${scoreData.balls}</div>
                  <div class="stat-label">Innings 2 Overs</div>
                </div>
              ` : `
                <div class="stat-card">
                  <div class="stat-number">${scoreData.runs}/${scoreData.wickets}</div>
                  <div class="stat-label">Current Score</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${scoreData.overs}.${scoreData.balls}</div>
                  <div class="stat-label">Current Overs</div>
                </div>
              `}
            </div>
          </div>
          
          ${currentBatsmen.length > 0 ? `
            <div class="players-section">
              <h3>Batting Performance</h3>
              <table class="table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Runs</th>
                    <th>Balls</th>
                    <th>4s</th>
                    <th>6s</th>
                    <th>Strike Rate</th>
                    <th>Last Shot</th>
                  </tr>
                </thead>
                <tbody>
                  ${currentBatsmen.map(batsman => `
                    <tr>
                      <td><strong>${batsman.name}</strong></td>
                      <td>${batsman.runs || 0}</td>
                      <td>${batsman.balls || 0}</td>
                      <td>${batsman.fours || 0}</td>
                      <td>${batsman.sixes || 0}</td>
                      <td>${(batsman.balls || 0) > 0 ? (((batsman.runs || 0) / (batsman.balls || 0)) * 100).toFixed(1) : '0.0'}%</td>
                      <td>${batsman.lastShot || 'N/A'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
          
          ${currentBowler ? `
            <div class="players-section">
              <h3>Bowling Performance</h3>
              <table class="table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Overs</th>
                    <th>Runs</th>
                    <th>Wickets</th>
                    <th>Economy Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>${currentBowler.name}</strong></td>
                    <td>${currentBowler.overs || 0}</td>
                    <td>${currentBowler.runs || 0}</td>
                    <td>${currentBowler.wickets || 0}</td>
                    <td>${(currentBowler.overs || 0) > 0 ? ((currentBowler.runs || 0) / (currentBowler.overs || 0)).toFixed(2) : '0.00'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ` : ''}
          
          <div class="score-section">
            <h3>Match Statistics</h3>
            <div class="stats">
              <div class="stat-card">
                <div class="stat-number">${currentBatsmen.reduce((acc, b) => acc + (b.fours || 0), 0)}</div>
                <div class="stat-label">Total Fours</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${currentBatsmen.reduce((acc, b) => acc + (b.sixes || 0), 0)}</div>
                <div class="stat-label">Total Sixes</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${currentBatsmen.reduce((acc, b) => acc + (b.fours || 0) + (b.sixes || 0), 0)}</div>
                <div class="stat-label">Total Boundaries</div>
              </div>
            </div>
          </div>
          
          <div class="score-section">
            <p><strong>Report Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `;

      // Create a new window and print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(content);
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.onload = () => {
          printWindow.print();
        };
        
        toast({
          title: "PDF Export",
          description: "Print dialog opened. Choose 'Save as PDF' in your browser's print dialog.",
        });
      } else {
        toast({
          title: "Error",
          description: "Unable to open print dialog. Please allow popups for this site.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive"
      });
    }

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Match Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Export Format</label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={generateReport}
              className="w-full flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Export as {format.toUpperCase()}
            </Button>
            
            <Button 
              onClick={generatePDF}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Export as PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportReport;
