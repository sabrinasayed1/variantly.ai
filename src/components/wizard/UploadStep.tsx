import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { VariantData } from '@/types/comparison';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface UploadStepProps {
  variantA: VariantData;
  variantB: VariantData;
  onUpdateA: (data: VariantData) => void;
  onUpdateB: (data: VariantData) => void;
}

export default function UploadStep({ variantA, variantB, onUpdateA, onUpdateB }: UploadStepProps) {
  const { toast } = useToast();

  const handleFileUpload = (file: File, variant: 'A' | 'B') => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (PNG, JPG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      if (variant === 'A') {
        onUpdateA({ ...variantA, imageUrl, imageFile: file });
      } else {
        onUpdateB({ ...variantB, imageUrl, imageFile: file });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent, variant: 'A' | 'B') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file, variant);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, variant: 'A' | 'B') => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, variant);
  };

  const clearImage = (variant: 'A' | 'B') => {
    if (variant === 'A') {
      onUpdateA({ id: 'A' });
    } else {
      onUpdateB({ id: 'B' });
    }
  };

  const UploadZone = ({ variant, data }: { variant: 'A' | 'B', data: VariantData }) => (
    <Card className="relative overflow-hidden transition-all hover:shadow-lg">
      {data.imageUrl ? (
        <div className="relative aspect-[4/3] bg-muted">
          <img 
            src={data.imageUrl} 
            alt={`Variant ${variant}`}
            className="w-full h-full object-contain"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-4 right-4"
            onClick={() => clearImage(variant)}
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <p className="text-white font-semibold">Variant {variant}</p>
          </div>
        </div>
      ) : (
        <div
          onDrop={(e) => handleDrop(e, variant)}
          onDragOver={(e) => e.preventDefault()}
          className="aspect-[4/3] flex flex-col items-center justify-center p-8 border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer bg-muted/30"
          onClick={() => document.getElementById(`file-${variant}`)?.click()}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Variant {variant}</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Drag & drop your mockup or screenshot
          </p>
          <Button variant="outline" size="sm">
            <ImageIcon className="w-4 h-4 mr-2" />
            Choose File
          </Button>
          <p className="text-xs text-muted-foreground mt-4">PNG, JPG, or PDF</p>
          <input
            id={`file-${variant}`}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => handleFileInput(e, variant)}
          />
        </div>
      )}
    </Card>
  );

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Upload Your Variants</h2>
        <p className="text-muted-foreground">Upload screenshots or mockups of both design variants to compare</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <UploadZone variant="A" data={variantA} />
        <UploadZone variant="B" data={variantB} />
      </div>

      {variantA.imageUrl && variantB.imageUrl && (
        <div className="mt-6 text-center">
          <p className="text-sm text-success font-medium">
            ✓ Both variants uploaded successfully
          </p>
        </div>
      )}
    </div>
  );
}
