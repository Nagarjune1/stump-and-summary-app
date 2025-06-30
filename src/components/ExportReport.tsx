
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, FileText, Share } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ExportReport = ({ matchData, scoreData, currentBatsmen, currentBowler }) => {
  const generateReportData = () => {
    return {
      match: matchData,
      score: scoreData,
      batsmen: currentBatsmen,
      bowler: currentBowler,
      generatedAt: new Date().toISOString()
    };
  };

  const handleDownloadJSON = () => {
    try {
      const reportData = generateReportData();
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `match_report_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Report Downloaded",
        description: "Match report has been downloaded as JSON file",
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the report",
        variant: "destructive"
      });
    }
  };

  const handleDownloadText = () => {
    try {
      const reportData = generateReportData();
      let textReport = `CRICKET MATCH REPORT\n`;
      textReport += `========================\n\n`;
      
      if (matchData) {
        textReport += `Match: ${matchData.team1?.name || 'Team 1'} vs ${matchData.team2?.name || 'Team 2'}\n`;
        textReport += `Venue: ${matchData.venue || 'Unknown'}\n`;
        textReport += `Date: ${matchData.match_date || 'Unknown'}\n`;
        if (matchData.match_time) textReport += `Time: ${matchData.match_time}\n`;
        textReport += `Format: ${matchData.format || 'Unknown'}\n\n`;
      }
      
      if (scoreData) {
        textReport += `CURRENT SCORE\n`;
        textReport += `-------------\n`;
        textReport += `Runs: ${scoreData.runs}\n`;
        textReport += `Wickets: ${scoreData.wickets}\n`;
        textReport += `Overs: ${scoreData.overs}\n`;
        textReport += `Run Rate: ${(scoreData.runs / (Math.floor(scoreData.overs) + (scoreData.overs % 1) * 10/6)).toFixed(2)}\n\n`;
      }
      
      if (currentBatsmen && currentBatsmen.length > 0) {
        textReport += `CURRENT BATSMEN\n`;
        textReport += `---------------\n`;
        currentBatsmen.forEach((batsman, index) => {
          textReport += `${index + 1}. ${batsman.name} - ${batsman.runs}(${batsman.balls}) [4s: ${batsman.fours}, 6s: ${batsman.sixes}]\n`;
        });
        textReport += `\n`;
      }
      
      if (currentBowler) {
        textReport += `CURRENT BOWLER\n`;
        textReport += `--------------\n`;
        textReport += `${currentBowler.name} - ${currentBowler.overs} overs, ${currentBowler.runs} runs, ${currentBowler.wickets} wickets\n`;
        textReport += `Economy: ${(currentBowler.runs / currentBowler.overs).toFixed(1)}\n\n`;
      }
      
      textReport += `Report generated on: ${new Date().toLocaleString()}\n`;
      
      const dataUri = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(textReport);
      const exportFileDefaultName = `match_report_${new Date().toISOString().split('T')[0]}.txt`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Report Downloaded",
        description: "Match report has been downloaded as text file",
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the report",
        variant: "destructive"
      });
    }
  };

  const handleCopyToClipboard = () => {
    try {
      const reportData = generateReportData();
      let textReport = `🏏 CRICKET MATCH REPORT\n\n`;
      
      if (matchData) {
        textReport += `📍 ${matchData.team1?.name || 'Team 1'} vs ${matchData.team2?.name || 'Team 2'}\n`;
        textReport += `🏟️ ${matchData.venue || 'Unknown venue'}\n`;
        textReport += `📅 ${matchData.match_date || 'Unknown date'}\n\n`;
      }
      
      if (scoreData) {
        textReport += `📊 SCORE: ${scoreData.runs}/${scoreData.wickets} (${scoreData.overs} overs)\n`;
        textReport += `📈 Run Rate: ${(scoreData.runs / (Math.floor(scoreData.overs) + (scoreData.overs % 1) * 10/6)).toFixed(2)}\n\n`;
      }
      
      if (currentBatsmen && currentBatsmen.length > 0) {
        textReport += `🏏 BATSMEN:\n`;
        currentBatsmen.forEach((batsman, index) => {
          textReport += `${index + 1}. ${batsman.name}: ${batsman.runs}(${batsman.balls})\n`;
        });
        textReport += `\n`;
      }
      
      textReport += `Generated: ${new Date().toLocaleString()}`;
      
      navigator.clipboard.writeText(textReport).then(() => {
        toast({
          title: "Copied to Clipboard",
          description: "Match report has been copied to clipboard",
        });
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy report to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="w-4 h-4" />
          Export Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Match Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button 
                  onClick={handleDownloadJSON}
                  className="w-full justify-start gap-3"
                  variant="outline"
                >
                  <Download className="w-4 h-4" />
                  Download as JSON
                </Button>
                
                <Button 
                  onClick={handleDownloadText}
                  className="w-full justify-start gap-3"
                  variant="outline"
                >
                  <Download className="w-4 h-4" />
                  Download as Text
                </Button>
                
                <Button 
                  onClick={handleCopyToClipboard}
                  className="w-full justify-start gap-3"
                  variant="outline"
                >
                  <Share className="w-4 h-4" />
                  Copy to Clipboard
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-sm text-gray-600">
            <p>Reports include current match status, scores, player statistics, and bowling figures.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportReport;
