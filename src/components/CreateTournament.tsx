
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CreateTournament = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ball_type: '',
    tournament_style: '',
    category: '',
    start_date: '',
    end_date: '',
    registration_fee: '0',
    prize_money: '0',
    max_teams: '16',
    organizer_name: '',
    organizer_contact: '',
    organizer_email: '',
    venue_id: '',
    rules: '',
    logo_url: ''
  });
  
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name');

      if (error) throw error;
      setVenues(data || []);
    } catch (error) {
      console.error('Error fetching venues:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.ball_type || !formData.tournament_style || 
        !formData.category || !formData.start_date || !formData.organizer_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const tournamentData = {
        ...formData,
        registration_fee: parseFloat(formData.registration_fee) || 0,
        prize_money: parseFloat(formData.prize_money) || 0,
        max_teams: parseInt(formData.max_teams) || 16,
        venue_id: formData.venue_id || null,
        status: 'upcoming'
      };

      await onSubmit(tournamentData);
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast.error('Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Tournament</h1>
          <p className="text-gray-600">Set up your cricket tournament with all the details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Tournament Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter tournament name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your tournament"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="logo_url">Tournament Logo URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => handleInputChange('logo_url', e.target.value)}
                  placeholder="https://example.com/logo.jpg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tournament Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Tournament Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ball_type">Ball Type *</Label>
                <Select value={formData.ball_type} onValueChange={(value) => handleInputChange('ball_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ball type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tennis">Tennis Ball</SelectItem>
                    <SelectItem value="leather">Leather Ball</SelectItem>
                    <SelectItem value="tape">Tape Ball</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tournament_style">Tournament Style *</Label>
                <Select value={formData.tournament_style} onValueChange={(value) => handleInputChange('tournament_style', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tournament style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="knockout">Knockout</SelectItem>
                    <SelectItem value="league">League</SelectItem>
                    <SelectItem value="round_robin">Round Robin</SelectItem>
                    <SelectItem value="group_stage">Group Stage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="u16">Under 16</SelectItem>
                    <SelectItem value="u19">Under 19</SelectItem>
                    <SelectItem value="u23">Under 23</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="box_cricket">Box Cricket</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="max_teams">Maximum Teams</Label>
                <Input
                  id="max_teams"
                  type="number"
                  value={formData.max_teams}
                  onChange={(e) => handleInputChange('max_teams', e.target.value)}
                  min="4"
                  max="64"
                />
              </div>
            </CardContent>
          </Card>

          {/* Schedule & Venue */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule & Venue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  min={formData.start_date}
                />
              </div>

              <div>
                <Label htmlFor="venue_id">Venue</Label>
                <Select value={formData.venue_id} onValueChange={(value) => handleInputChange('venue_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name} - {venue.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Financial & Organizer */}
          <Card>
            <CardHeader>
              <CardTitle>Financial & Organizer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="registration_fee">Registration Fee (₹)</Label>
                <Input
                  id="registration_fee"
                  type="number"
                  value={formData.registration_fee}
                  onChange={(e) => handleInputChange('registration_fee', e.target.value)}
                  min="0"
                  step="100"
                />
              </div>

              <div>
                <Label htmlFor="prize_money">Prize Money (₹)</Label>
                <Input
                  id="prize_money"
                  type="number"
                  value={formData.prize_money}
                  onChange={(e) => handleInputChange('prize_money', e.target.value)}
                  min="0"
                  step="1000"
                />
              </div>

              <div>
                <Label htmlFor="organizer_name">Organizer Name *</Label>
                <Input
                  id="organizer_name"
                  value={formData.organizer_name}
                  onChange={(e) => handleInputChange('organizer_name', e.target.value)}
                  placeholder="Enter organizer name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="organizer_contact">Contact Number</Label>
                <Input
                  id="organizer_contact"
                  value={formData.organizer_contact}
                  onChange={(e) => handleInputChange('organizer_contact', e.target.value)}
                  placeholder="+91-9876543210"
                />
              </div>

              <div>
                <Label htmlFor="organizer_email">Email</Label>
                <Input
                  id="organizer_email"
                  type="email"
                  value={formData.organizer_email}
                  onChange={(e) => handleInputChange('organizer_email', e.target.value)}
                  placeholder="organizer@example.com"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Tournament Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.rules}
              onChange={(e) => handleInputChange('rules', e.target.value)}
              placeholder="Enter tournament rules and regulations..."
              rows={6}
            />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading ? 'Creating...' : 'Create Tournament'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTournament;
