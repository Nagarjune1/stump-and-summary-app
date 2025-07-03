
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Image, Share, Camera } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const EnhancedExportReport = ({ 
  matchData, 
  scoreData, 
  currentBatsmen, 
  currentBowler, 
  innings1Score, 
  currentInnings, 
  winner,
  manOfMatch,
  manOfSeries,
  recentBalls = [],
  allPlayers = []
}) => {
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");

  const generateMatchReport = () => {
    const report = {
      matchInfo: {
        title: `${matchData.team1?.name} vs ${matchData.team2?.name}`,
        venue: matchData.venue,
        date: matchData.match_date,
        format: matchData.format,
        overs: matchData.overs,
        result: winner
      },
      toss: {
        winner: matchData.toss_winner || 'Not specified',
        decision: matchData.toss_decision || 'Not specified'
      },
      innings: {
        first: {
          team: matchData.team1?.name,
          score: `${innings1Score.runs}/${innings1Score.wickets}`,
          overs: `${innings1Score.overs}.0`,
          runRate: innings1Score.overs > 0 ? (innings1Score.runs / innings1Score.overs).toFixed(2) : '0.00'
        },
        second: currentInnings === 2 ? {
          team: matchData.team2?.name,
          score: `${scoreData.runs}/${scoreData.wickets}`,
          overs: `${scoreData.overs}.${scoreData.balls || 0}`,
          runRate: (scoreData.overs + (scoreData.balls || 0) / 6) > 0 ? 
            (scoreData.runs / (scoreData.overs + (scoreData.balls || 0) / 6)).toFixed(2) : '0.00'
        } : null
      },
      performance: {
        currentBatsmen: allPlayers.filter(p => p.runs !== undefined).map(batsman => ({
          name: batsman.name,
          runs: batsman.runs || 0,
          balls: batsman.balls || 0,
          fours: batsman.fours || 0,
          sixes: batsman.sixes || 0,
          strikeRate: (batsman.balls || 0) > 0 ? 
            (((batsman.runs || 0) / (batsman.balls || 0)) * 100).toFixed(1) : '0.0'
        })),
        bowlers: allPlayers.filter(p => p.overs !== undefined && p.overs > 0).map(bowler => ({
          name: bowler.name,
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
    if (!winner) return "Match in progress";
    
    const topScorer = allPlayers.reduce((top, player) => 
      (player.runs || 0) > (top.runs || 0) ? player : top, allPlayers[0] || {});
    
    let summary = winner;
    
    if (topScorer.name) {
      summary += `. ${topScorer.name} top scored with ${topScorer.runs || 0}(${topScorer.balls || 0}).`;
    }
    
    return summary;
  };

  const exportAsPDF = async (report) => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let currentY = 20;

      // Title
      pdf.setFontSize(20);
      pdf.text(report.matchInfo.title, pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      // Match Info
      pdf.setFontSize(12);
      pdf.text(`Venue: ${report.matchInfo.venue}`, 20, currentY);
      currentY += 8;
      pdf.text(`Date: ${report.matchInfo.date}`, 20, currentY);
      currentY += 8;
      pdf.text(`Result: ${report.matchInfo.result || 'In Progress'}`, 20, currentY);
      currentY += 15;

      // Scorecard
      pdf.setFontSize(14);
      pdf.text('SCORECARD', 20, currentY);
      currentY += 10;

      pdf.setFontSize(10);
      pdf.text(`${report.innings.first.team}: ${report.innings.first.score} (${report.innings.first.overs} overs)`, 20, currentY);
      currentY += 8;

      if (report.innings.second) {
        pdf.text(`${report.innings.second.team}: ${report.innings.second.score} (${report.innings.second.overs} overs)`, 20, currentY);
        currentY += 8;
      }

      // Batting Performance
      if (report.performance.currentBatsmen.length > 0) {
        currentY += 10;
        pdf.setFontSize(12);
        pdf.text('BATTING PERFORMANCE', 20, currentY);
        currentY += 10;

        pdf.setFontSize(10);
        report.performance.currentBatsmen.forEach(batsman => {
          pdf.text(`${batsman.name}: ${batsman.runs}(${batsman.balls}) - SR: ${batsman.strikeRate}`, 20, currentY);
          currentY += 6;
        });
      }

      // Bowling Performance
      if (report.performance.bowlers.length > 0) {
        currentY += 10;
        pdf.setFontSize(12);
        pdf.text('BOWLING PERFORMANCE', 20, currentY);
        currentY += 10;

        pdf.setFontSize(10);
        report.performance.bowlers.forEach(bowler => {
          pdf.text(`${bowler.name}: ${bowler.overs} ov, ${bowler.runs} runs, ${bowler.wickets} wickets - ECO: ${bowler.economy}`, 20, currentY);
          currentY += 6;
        });
      }

      pdf.save(`${matchData.team1?.name}_vs_${matchData.team2?.name}_report.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  const exportAsPNG = async () => {
    try {
      // Create a temporary div with match report content
      const tempDiv = document.createElement('div');
      tempDiv.style.width = '800px';
      tempDiv.style.padding = '20px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';

      const report = generateMatchReport();
      
      tempDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #333; margin-bottom: 10px;">${report.matchInfo.title}</h1>
          <p style="color: #666;">${report.matchInfo.venue} • ${report.matchInfo.date}</p>
          <p style="color: #333; font-weight: bold; font-size: 18px;">${report.matchInfo.result || 'Match in Progress'}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
            <h3 style="color: #333; margin-bottom: 10px;">First Innings</h3>
            <p><strong>${report.innings.first.team}:</strong> ${report.innings.first.score} (${report.innings.first.overs} overs)</p>
            <p>Run Rate: ${report.innings.first.runRate}</p>
          </div>
          ${report.innings.second ? `
          <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
            <h3 style="color: #333; margin-bottom: 10px;">Second Innings</h3>
            <p><strong>${report.innings.second.team}:</strong> ${report.innings.second.score} (${report.innings.second.overs} overs)</p>
            <p>Run Rate: ${report.innings.second.runRate}</p>
          </div>
          ` : ''}
        </div>

        ${report.awards.manOfMatch ? `
        <div style="text-align: center; background: linear-gradient(45deg, #ffd700, #ffed4e); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-bottom: 5px;">🏆 Player of the Match</h3>
          <p style="font-size: 18px; font-weight: bold;">${report.awards.manOfMatch}</p>
        </div>
        ` : ''}
        
        <div style="text-align: center; color: #666; font-size: 12px;">
          Generated on ${new Date().toLocaleString()}
        </div>
      `;

      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, {
        width: 800,
        height: tempDiv.scrollHeight,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(tempDiv);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${matchData.team1?.name}_vs_${matchData.team2?.name}_scorecard.png`;
        a.click();
        URL.revokeObjectURL(url);
      });

    } catch (error) {
      console.error('Error generating PNG:', error);
      throw error;
    }
  };

  const handleExport = async () => {
    setExporting(true);
    
    try {
      const report = generateMatchReport();
      
      switch (exportFormat) {
        case 'pdf':
          await exportAsPDF(report);
          break;
        case 'png':
          await exportAsPNG();
          break;
        case 'json':
          const jsonContent = JSON.stringify(report, null, 2);
          const jsonBlob = new Blob([jsonContent], { type: 'application/json' });
          const jsonUrl = URL.createObjectURL(jsonBlob);
          const jsonA = document.createElement('a');
          jsonA.href = jsonUrl;
          jsonA.download = `${matchData.team1?.name}_vs_${matchData.team2?.name}_report.json`;
          jsonA.click();
          URL.revokeObjectURL(jsonUrl);
          break;
        default:
          await exportAsPDF(report);
      }
      
      toast({
        title: "Export Successful!",
        description: `Match report exported as ${exportFormat.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the report",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => setExporting(false), 1000);
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
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    PDF Document
                  </div>
                </SelectItem>
                <SelectItem value="png">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    PNG Image
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    JSON Data
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleExport} 
            disabled={exporting}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedExportReport;
