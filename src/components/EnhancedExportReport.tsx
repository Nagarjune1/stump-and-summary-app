
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Share2, FileText, Image as ImageIcon, Trophy, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import CompleteMatchScorecard from "./CompleteMatchScorecard";

const EnhancedExportReport = ({ 
  matchData, 
  scoreData, 
  currentBatsmen = [], 
  currentBowler = null,
  innings1Score = null,
  innings2Score = null,
  currentInnings = 1,
  winner = null,
  recentBalls = [],
  topPerformers = [],
  fallOfWickets = [],
  bowlingFigures = []
}) => {
  const [exporting, setExporting] = useState(false);

  const exportToPDF = async () => {
    setExporting(true);
    try {
      const element = document.getElementById('complete-scorecard');
      if (!element) {
        toast({
          title: "Error",
          description: "Scorecard not found for export",
          variant: "destructive"
        });
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${matchData?.team1?.name || 'Team1'}_vs_${matchData?.team2?.name || 'Team2'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Success!",
        description: "Match scorecard exported successfully",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: "Failed to export scorecard",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const exportAsImage = async () => {
    setExporting(true);
    try {
      const element = document.getElementById('complete-scorecard');
      if (!element) {
        toast({
          title: "Error",
          description: "Scorecard not found for export",
          variant: "destructive"
        });
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const link = document.createElement('a');
      link.download = `${matchData?.team1?.name || 'Team1'}_vs_${matchData?.team2?.name || 'Team2'}_scorecard.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast({
        title: "Success!",
        description: "Scorecard image downloaded successfully",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: "Failed to export image",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const generateSummaryReport = () => {
    const report = {
      match: {
        teams: `${matchData?.team1?.name || 'Team 1'} vs ${matchData?.team2?.name || 'Team 2'}`,
        venue: matchData?.venue,
        date: matchData?.match_date,
        format: matchData?.format,
        result: winner
      },
      innings1: innings1Score,
      innings2: innings2Score,
      topPerformers,
      fallOfWickets,
      bowlingFigures
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${matchData?.team1?.name || 'Team1'}_vs_${matchData?.team2?.name || 'Team2'}_report.json`;
    link.click();

    toast({
      title: "Success!",
      description: "Match report exported successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Download className="w-6 h-6" />
          Enhanced Export & Reports
        </h2>
        <Badge className="bg-blue-100 text-blue-800">
          Professional Reports
        </Badge>
      </div>

      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="export">Export Options</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Match Scorecard Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div id="complete-scorecard" className="bg-white p-4 rounded-lg">
                <CompleteMatchScorecard
                  matchData={matchData}
                  innings1Score={innings1Score}
                  innings2Score={currentInnings === 2 ? scoreData : null}
                  currentBatsmen={currentBatsmen}
                  currentBowler={currentBowler}
                  topPerformers={topPerformers}
                  fallOfWickets={fallOfWickets}
                  bowlingFigures={bowlingFigures}
                  matchResult={winner}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  PDF Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Export complete scorecard as PDF with all match details, statistics, and player performances.
                </p>
                <Button 
                  onClick={exportToPDF} 
                  disabled={exporting}
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {exporting ? 'Exporting...' : 'Export as PDF'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Image Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Download scorecard as high-resolution image perfect for sharing on social media.
                </p>
                <Button 
                  onClick={exportAsImage} 
                  disabled={exporting}
                  className="w-full"
                  variant="outline"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {exporting ? 'Exporting...' : 'Export as Image'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Data Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Export match data in JSON format for further analysis and record keeping.
                </p>
                <Button 
                  onClick={generateSummaryReport}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Match Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Match Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Teams:</strong> {matchData?.team1?.name || 'Team 1'} vs {matchData?.team2?.name || 'Team 2'}</p>
                      <p><strong>Venue:</strong> {matchData?.venue}</p>
                      <p><strong>Date:</strong> {new Date(matchData?.match_date).toLocaleDateString()}</p>
                      <p><strong>Format:</strong> {matchData?.format}</p>
                      {winner && <p><strong>Result:</strong> {winner}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Key Statistics</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Total Runs:</strong> {(innings1Score?.runs || 0) + (scoreData?.runs || 0)}</p>
                      <p><strong>Total Wickets:</strong> {(innings1Score?.wickets || 0) + (scoreData?.wickets || 0)}</p>
                      <p><strong>Total Overs:</strong> {(innings1Score?.overs || 0) + (scoreData?.overs || 0)}</p>
                      <p><strong>Boundaries:</strong> {recentBalls.filter(b => b === '4' || b === '6').length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Match Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Performance Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Run Rate (Inn 1):</span>
                      <span className="font-medium">
                        {innings1Score?.overs > 0 ? (innings1Score.runs / innings1Score.overs).toFixed(2) : '0.00'}
                      </span>
                    </div>
                    {currentInnings === 2 && (
                      <div className="flex justify-between">
                        <span>Run Rate (Inn 2):</span>
                        <span className="font-medium">
                          {scoreData?.overs > 0 ? (scoreData.runs / scoreData.overs).toFixed(2) : '0.00'}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Boundaries %:</span>
                      <span className="font-medium">
                        {recentBalls.length > 0 ? ((recentBalls.filter(b => b === '4' || b === '6').length / recentBalls.length) * 100).toFixed(1) : '0.0'}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Match Highlights</h4>
                  <div className="space-y-2 text-sm">
                    <p>• Highest partnership: {Math.max(...(currentBatsmen.map(b => b.runs || 0)))} runs</p>
                    <p>• Best bowling figures: {bowlingFigures[0]?.name || 'N/A'}</p>
                    <p>• Most sixes: {recentBalls.filter(b => b === '6').length}</p>
                    <p>• Most fours: {recentBalls.filter(b => b === '4').length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedExportReport;
