import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { uploadCsvRequest, clearPreviewData } from '@/store/redux/passengers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CsvUploadModal = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { isUploading, uploadError } = useSelector((state: RootState) => state.passengers);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive"
      });
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      dispatch(uploadCsvRequest(selectedFile));
      toast({
        title: "Upload started",
        description: "Processing your CSV file...",
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedFile(null);
    dispatch(clearPreviewData());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  React.useEffect(() => {
    if (!isUploading && !uploadError && selectedFile) {
      toast({
        title: "Upload successful",
        description: "Passengers have been imported successfully",
      });
      handleClose();
    }
    if (uploadError) {
      toast({
        title: "Upload failed",
        description: uploadError,
        variant: "destructive"
      });
    }
  }, [isUploading, uploadError, selectedFile, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Upload className="w-4 h-4 mr-2" />
          Upload CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Upload Passenger CSV
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <p className="text-sm text-gray-500">
              Expected columns: name, pickupTime, pickupAddress, destination, contactNumber
            </p>
          </div>

          {selectedFile && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">{selectedFile.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
                disabled={isUploading}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700">{uploadError}</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CsvUploadModal;