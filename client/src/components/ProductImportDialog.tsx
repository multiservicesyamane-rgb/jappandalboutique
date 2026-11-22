import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CheckCircle2, Download, FileArchive, FileSpreadsheet, FileText, Loader2, UploadCloud, X } from "lucide-react";

type ImportMode = "upsert" | "create" | "update";

type ImportResult = {
  created: number;
  updated: number;
  skipped: number;
  categoriesCreated: number;
  errors: string[];
};

const ACCEPT = ".xlsx,.xlsm,.csv,.tsv,.json,.md,.markdown,.txt,.zip";
const MAX_SIZE = 15 * 1024 * 1024;

const CSV_TEMPLATE = [
  "nom,prix,categorie,description,unite,badge,stock,image",
  "Riz parfumé 5kg,3500,Alimentation & Épicerie,Riz de qualité supérieure,kg,,10,",
  "Huile végétale 1L,1800,Alimentation & Épicerie,Huile pour cuisine,L,,20,",
].join("\n");

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

interface ProductImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

export function ProductImportDialog({ open, onClose, onImported }: ProductImportDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ImportMode>("upsert");
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const importMutation = trpc.products.importProducts.useMutation();

  const reset = () => {
    setFile(null);
    setResult(null);
    setShowErrors(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClose = () => {
    if (importMutation.isPending) return;
    onClose();
    reset();
  };

  const chooseFile = (candidate?: File | null) => {
    if (!candidate) return;
    if (candidate.size > MAX_SIZE) {
      toast.error("Le fichier ne doit pas dépasser 15 Mo");
      return;
    }
    setFile(candidate);
    setResult(null);
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Choisissez d'abord un fichier");
      return;
    }

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const data = String(reader.result);
          resolve(data.slice(data.indexOf(",") + 1));
        };
        reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
        reader.readAsDataURL(file);
      });

      const summary = await importMutation.mutateAsync({
        fileName: file.name,
        fileData: base64,
        mode,
      });
      setResult(summary);
      onImported();
      if (summary.created + summary.updated > 0) {
        toast.success(`${summary.created + summary.updated} produit(s) importé(s)`);
      } else {
        toast.warning("Aucun produit importé — vérifiez le rapport");
      }
    } catch (error: any) {
      toast.error(`Import impossible : ${error?.message || "erreur inconnue"}`);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob(["\uFEFF" + CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modele-import-produits.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? undefined : handleClose())}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <UploadCloud className="h-5 w-5 text-[#1E5A8E]" />
            Importer des produits
          </DialogTitle>
          <DialogDescription className="text-xs">
            Excel, CSV, JSON, Markdown, texte ou ZIP (avec les images). Les catégories absentes sont créées automatiquement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Zone de dépôt */}
          <div
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              chooseFile(event.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragging ? "border-[#1E5A8E] bg-blue-50" : "border-gray-300 hover:border-[#1E5A8E] hover:bg-gray-50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(event) => chooseFile(event.target.files?.[0])}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-[#1E5A8E]" />
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(event) => { event.stopPropagation(); reset(); }}
                  className="ml-2 p-1 rounded-full hover:bg-gray-200"
                  title="Retirer le fichier"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            ) : (
              <>
                <UploadCloud className="h-9 w-9 mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  Déposez votre fichier ici ou cliquez pour parcourir
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  .xlsx · .csv · .json · .md · .txt · .zip — 15 Mo max
                </p>
              </>
            )}
          </div>

          {/* Mode d'import */}
          <div>
            <label className="text-xs font-semibold text-gray-700">Comportement</label>
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as ImportMode)}
              className="mt-1 w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
            >
              <option value="upsert">Créer ou mettre à jour (recommandé)</option>
              <option value="create">Créer uniquement (ignorer les existants)</option>
              <option value="update">Mettre à jour uniquement</option>
            </select>
          </div>

          {/* Aide formats */}
          <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-[#1E5A8E]" /> Colonnes reconnues
            </p>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              <strong>Nom</strong> et <strong>Prix</strong> sont obligatoires. Optionnels : Catégorie, Description,
              Unité, Badge, Stock, Image, Référence, Image2…5. Les en-têtes français et anglais sont acceptés
              (ex. « Titre du produit », « PrixminFCFA »).
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
              <span className="flex items-center gap-1"><FileSpreadsheet className="h-3.5 w-3.5" /> Excel / CSV</span>
              <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> JSON / Markdown</span>
              <span className="flex items-center gap-1"><FileArchive className="h-3.5 w-3.5" /> ZIP + images</span>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={downloadTemplate} className="h-7 text-[11px] gap-1.5">
              <Download className="h-3.5 w-3.5" /> Télécharger un modèle CSV
            </Button>
          </div>

          {/* Rapport */}
          {result && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 space-y-2">
              <p className="text-sm font-bold text-green-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Import terminé
              </p>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: "Créés", value: result.created },
                  { label: "Mis à jour", value: result.updated },
                  { label: "Ignorés", value: result.skipped },
                  { label: "Catégories", value: result.categoriesCreated },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-md py-2 border border-green-100">
                    <p className="text-lg font-black text-green-700">{stat.value}</p>
                    <p className="text-[10px] text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
              {result.errors.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowErrors(!showErrors)}
                    className="text-xs text-red-600 font-semibold hover:underline"
                  >
                    {result.errors.length} avertissement(s) — {showErrors ? "masquer" : "afficher"}
                  </button>
                  {showErrors && (
                    <ul className="mt-1 max-h-32 overflow-y-auto text-[11px] text-red-700 space-y-0.5 list-disc pl-4">
                      {result.errors.map((error, index) => <li key={index}>{error}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={handleClose} disabled={importMutation.isPending}>
              Fermer
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={!file || importMutation.isPending}
              className="bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white"
            >
              {importMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Import en cours…</>
              ) : (
                <><UploadCloud className="h-4 w-4 mr-2" /> Importer</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
