import { Upload as UploadIcon } from 'lucide-react';

export default function Upload() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UploadIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Upload Suppliers
          </h1>
          <p className="text-muted-foreground">
            Import suppliers via CSV or add manually
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 border-dashed">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            CSV Upload
          </h2>
          <p className="text-muted-foreground mb-4">
            Upload a CSV file with supplier names, websites, countries, and
            industries.
          </p>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <UploadIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Coming soon — drag & drop CSV here
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Manual Add
          </h2>
          <p className="text-muted-foreground mb-4">
            Add suppliers one by one using the form.
          </p>
          <p className="text-muted-foreground">
            Coming soon — manual supplier form.
          </p>
        </div>
      </div>
    </div>
  );
}
