'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { uploadFile } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building, FileText, Camera, CircleCheck as CheckCircle } from 'lucide-react';

export default function PartnerSignup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [businessLicense, setBusinessLicense] = useState<File | null>(null);
  const [motelName, setMotelName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [pocFirstName, setPocFirstName] = useState('');
  const [pocLastName, setPocLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [motelPhotos, setMotelPhotos] = useState<File[]>([]);
  const [agreementSigned, setAgreementSigned] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setMotelPhotos(prev => [...prev, ...files].slice(0, 20));
    }
  };

  const removePhoto = (index: number) => {
    setMotelPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!businessName || !motelName || !address || !city || !state || !zip ||
          !pocFirstName || !pocLastName || !phone || !email) {
        throw new Error('All fields are required');
      }

      if (!businessLicense) {
        throw new Error('Business license is required');
      }

      if (motelPhotos.length < 6) {
        throw new Error('Minimum 6 motel photos are required');
      }

      if (!agreementSigned) {
        throw new Error('You must sign the agreement to proceed');
      }

      let businessLicenseUrl = '';
      if (businessLicense) {
        businessLicenseUrl = await uploadFile(businessLicense, 'documents', 'business-licenses');
      }

      const photoUrls: string[] = [];
      for (const photo of motelPhotos) {
        const photoUrl = await uploadFile(photo, 'images', 'motel-photos');
        photoUrls.push(photoUrl);
      }

      const { error: insertError } = await supabase
        .from('vendor_applications')
        .insert({
          business_name: businessName,
          business_license_url: businessLicenseUrl,
          motel_name: motelName,
          address,
          city,
          state,
          zip,
          point_of_contact_first_name: pocFirstName,
          point_of_contact_last_name: pocLastName,
          phone,
          email,
          motel_photos: photoUrls,
          agreement_signed: true,
          agreement_signed_at: new Date().toISOString(),
          signup_stage: 'pending_approval',
          status: 'pending',
        });

      if (insertError) throw insertError;

      setSuccess(true);
    } catch (error: any) {
      console.error('Error submitting application:', error);
      setError(error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Application Submitted Successfully!</h1>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for applying to partner with MicroStay.us. We will review your application
            and respond within 24-48 hours.
          </p>
          <p className="text-gray-600 mb-8">
            You will receive an email at <strong>{email}</strong> with further instructions
            once your application is approved.
          </p>
          <Button onClick={() => router.push('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Partner with MicroStay</h1>
          <p className="text-gray-600">Complete the signup process to list your motel</p>
          <p className="text-sm text-red-600 mt-2">All fields are required</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="businessLicense">Business License Document *</Label>
                <Input
                  id="businessLicense"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setBusinessLicense(e.target.files?.[0] || null)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, JPG, PNG</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Motel Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="motelName">Motel Name *</Label>
                <Input
                  id="motelName"
                  value={motelName}
                  onChange={(e) => setMotelName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="zip">ZIP Code *</Label>
                  <Input
                    id="zip"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Point of Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pocFirstName">First Name *</Label>
                  <Input
                    id="pocFirstName"
                    value={pocFirstName}
                    onChange={(e) => setPocFirstName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="pocLastName">Last Name *</Label>
                  <Input
                    id="pocLastName"
                    value={pocLastName}
                    onChange={(e) => setPocLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Motel Photos (Minimum 6 Required) *
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {motelPhotos.length} photo{motelPhotos.length !== 1 ? 's' : ''}
                  {motelPhotos.length < 6 && ` (${6 - motelPhotos.length} more required)`}
                </p>
              </div>

              {motelPhotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {motelPhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => removePhoto(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Agreement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <a
                  href="/MicroStay_Final_Agreement.docx"
                  download
                  className="text-blue-600 hover:underline"
                >
                  Download MicroStay Partner Agreement
                </a>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreement"
                  checked={agreementSigned}
                  onCheckedChange={(checked) => setAgreementSigned(checked as boolean)}
                />
                <Label htmlFor="agreement" className="text-sm">
                  I have read and agree to the terms and conditions outlined in the
                  MicroStay Partner Agreement. I understand that my application will be
                  reviewed within 24-48 hours. *
                </Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1"
              size="lg"
              disabled={loading || motelPhotos.length < 6 || !agreementSigned}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.push('/')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
