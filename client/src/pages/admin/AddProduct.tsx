import { useState, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertCircle, CheckCircle2, Upload, Trash2, Plus, ArrowLeft,
  Image as ImageIcon, Video, Link as LinkIcon, Loader2,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

type ImageSlot = { file: File | null; preview: string; existingUrl: string };

const emptySlot = (): ImageSlot => ({ file: null, preview: '', existingUrl: '' });

export default function AddProduct() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    unit: 'Pièce',
    badge: '',
    stockQty: '10',
    description: '',
    metaTitle: '',
    metaDescription: '',
    tags: '',
    videoUrl: '',
  });

  // 5 image slots
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([
    emptySlot(), emptySlot(), emptySlot(), emptySlot(), emptySlot(),
  ]);

  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const utils = trpc.useUtils();
  const { data: categories } = trpc.categories.list.useQuery();
  const uploadImage = trpc.products.uploadImage.useMutation();
  const createProduct = trpc.products.create.useMutation();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 10 Mo)');
      return;
    }
    const preview = URL.createObjectURL(file);
    setImageSlots(prev => {
      const next = [...prev];
      next[index] = { file, preview, existingUrl: '' };
      return next;
    });
  };

  const handleRemoveImage = (index: number) => {
    setImageSlots(prev => {
      const next = [...prev];
      if (next[index].preview) URL.revokeObjectURL(next[index].preview);
      next[index] = emptySlot();
      return next;
    });
  };

  const uploadSlot = async (slot: ImageSlot): Promise<string> => {
    if (!slot.file) return slot.existingUrl;
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const b64 = result.split(',')[1];
        if (b64) resolve(b64);
        else reject(new Error('Échec lecture fichier'));
      };
      reader.onerror = () => reject(new Error('Échec lecture fichier'));
      reader.readAsDataURL(slot.file!);
    });
    const result = await uploadImage.mutateAsync({
      fileName: slot.file.name,
      fileData: base64,
      mimeType: slot.file.type || 'image/jpeg',
    });
    return result.url;
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) { toast.error('Le nom du produit est obligatoire'); return false; }
    if (!formData.categoryId) { toast.error('Veuillez sélectionner une catégorie'); return false; }
    if (!formData.price || isNaN(parseFloat(formData.price))) { toast.error('Le prix est obligatoire'); return false; }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    setCurrentStep(s => Math.min(4, s + 1));
  };

  const handlePublish = async () => {
    if (!validateStep1()) { setCurrentStep(1); return; }

    setIsSubmitting(true);
    try {
      // Upload all images that have files
      const [url1, url2, url3, url4, url5] = await Promise.all(imageSlots.map(uploadSlot));

      await createProduct.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: formData.price,
        unit: formData.unit || undefined,
        imageUrl: url1 || undefined,
        image2Url: url2 || undefined,
        image3Url: url3 || undefined,
        image4Url: url4 || undefined,
        image5Url: url5 || undefined,
        videoUrl: formData.videoUrl.trim() || undefined,
        categoryId: parseInt(formData.categoryId),
        badge: formData.badge || undefined,
        inStock: parseInt(formData.stockQty) || 1,
      });

      await utils.products.list.invalidate();
      toast.success('Produit publié avec succès !');
      navigate('/admin/produits');
    } catch (err: any) {
      toast.error(`Erreur: ${err.message || 'Échec de la publication'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Informations', description: 'Détails principaux' },
    { number: 2, title: 'Médias', description: 'Images & vidéo' },
    { number: 3, title: 'Description', description: 'Contenu détaillé' },
    { number: 4, title: 'SEO', description: 'Optimisation' },
  ];

  const filledImages = imageSlots.filter(s => s.file || s.existingUrl).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin/produits">
            <button className="w-9 h-9 rounded-lg border bg-white flex items-center justify-center hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ajouter un Produit</h1>
            <p className="text-sm text-slate-500">Créez une fiche produit complète</p>
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Progression</span>
              <span className="font-bold text-blue-600">{Math.round((currentStep / 4) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((currentStep / 4) * 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Step Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {steps.map((step) => (
            <button
              key={step.number}
              onClick={() => { if (step.number < currentStep || (step.number === 1) || (currentStep === 1 && validateStep1())) setCurrentStep(step.number); }}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                currentStep === step.number
                  ? 'border-blue-500 bg-blue-50'
                  : currentStep > step.number
                  ? 'border-green-500 bg-green-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                  currentStep === step.number ? 'bg-blue-500 text-white'
                  : currentStep > step.number ? 'bg-green-500 text-white'
                  : 'bg-slate-200 text-slate-600'
                }`}>
                  {currentStep > step.number ? <CheckCircle2 size={14} /> : step.number}
                </div>
                <span className="text-xs font-semibold text-slate-800 leading-tight">{step.title}</span>
                <span className="text-[10px] text-slate-400 hidden md:block">{step.description}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* ── Étape 1: Informations ── */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="name">Nom du produit *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Riz Basmati Premium 5kg"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Catégorie *</Label>
                    <Select value={formData.categoryId} onValueChange={(v) => handleInputChange('categoryId', v)}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Choisir une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.emoji} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Unité</Label>
                    <Select value={formData.unit} onValueChange={(v) => handleInputChange('unit', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pièce">Pièce</SelectItem>
                        <SelectItem value="Kg">Kilogramme (Kg)</SelectItem>
                        <SelectItem value="g">Gramme (g)</SelectItem>
                        <SelectItem value="L">Litre (L)</SelectItem>
                        <SelectItem value="cl">Centilitre (cl)</SelectItem>
                        <SelectItem value="Paquet">Paquet</SelectItem>
                        <SelectItem value="Boîte">Boîte</SelectItem>
                        <SelectItem value="Sachet">Sachet</SelectItem>
                        <SelectItem value="Carton">Carton</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Prix (FCFA) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock disponible</Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="10"
                      value={formData.stockQty}
                      onChange={(e) => handleInputChange('stockQty', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label>Badge / Étiquette</Label>
                  <Select value={formData.badge} onValueChange={(v) => handleInputChange('badge', v)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Aucun badge" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun</SelectItem>
                      <SelectItem value="Nouveau">🆕 Nouveau</SelectItem>
                      <SelectItem value="Promo">🔥 Promo</SelectItem>
                      <SelectItem value="Premium">⭐ Premium</SelectItem>
                      <SelectItem value="Populaire">👍 Populaire</SelectItem>
                      <SelectItem value="Bio">🌿 Bio</SelectItem>
                      <SelectItem value="Local">🇸🇳 Local</SelectItem>
                      <SelectItem value="Rupture">❌ Rupture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* ── Étape 2: Médias ── */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold">Images produit</p>
                    <p className="text-xs mt-0.5">Jusqu'à 5 images (JPG, PNG, WebP — max 10 Mo chacune). La première image est l'image principale affichée dans le catalogue.</p>
                  </div>
                </div>

                {/* Image slots grid */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">
                    Images ({filledImages}/5)
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {imageSlots.map((slot, idx) => (
                      <div key={idx} className="relative">
                        <input
                          ref={fileInputRefs[idx]}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(idx, file);
                            e.target.value = '';
                          }}
                        />
                        {slot.file || slot.existingUrl ? (
                          <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 group">
                            <img
                              src={slot.preview || slot.existingUrl}
                              alt={`Image ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {idx === 0 && (
                              <div className="absolute top-1 left-1 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Principal
                              </div>
                            )}
                            <button
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => fileInputRefs[idx].current?.click()}
                            className="w-full aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-1 group"
                          >
                            <ImageIcon className="h-5 w-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                            <span className="text-[10px] text-slate-400 group-hover:text-blue-500">
                              {idx === 0 ? 'Image principale' : `Image ${idx + 1}`}
                            </span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload bulk */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Upload rapide</Label>
                  <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-300 rounded-xl py-8 px-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group">
                    <Upload className="h-8 w-8 text-slate-300 group-hover:text-blue-400 mb-2 transition-colors" />
                    <p className="text-sm text-slate-500 group-hover:text-blue-600 font-medium">Cliquez pour sélectionner des images</p>
                    <p className="text-xs text-slate-400 mt-1">ou glissez-déposez ici</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach((file) => {
                          const emptyIdx = imageSlots.findIndex(s => !s.file && !s.existingUrl);
                          if (emptyIdx !== -1) handleFileSelect(emptyIdx, file);
                        });
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                {/* Video section */}
                <div className="border-t pt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Video className="h-4 w-4 text-purple-600" />
                    <Label className="text-sm font-semibold">Vidéo produit</Label>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Optionnel</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Ajoutez un lien vidéo YouTube, Vimeo ou direct MP4 pour présenter votre produit en détail.
                  </p>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                      value={formData.videoUrl}
                      onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {formData.videoUrl && (
                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2">
                      <Video className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <span className="text-xs text-purple-700 truncate">{formData.videoUrl}</span>
                      <button onClick={() => handleInputChange('videoUrl', '')} className="ml-auto text-purple-400 hover:text-purple-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Étape 3: Description ── */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="description">Description complète</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre produit en détail : composition, avantages, mode d'utilisation, origine, valeurs nutritionnelles..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-1.5 min-h-48 text-sm"
                  />
                  <p className="text-xs text-slate-400 mt-1">{formData.description.length} caractères</p>
                </div>
              </div>
            )}

            {/* ── Étape 4: SEO ── */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
                  <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                  <div className="text-sm text-green-800">
                    <p className="font-semibold">Vous êtes presque prêt !</p>
                    <p className="text-xs mt-0.5">Ces champs sont optionnels mais améliorent la visibilité de votre produit.</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="metaTitle">Titre SEO</Label>
                  <Input
                    id="metaTitle"
                    placeholder={formData.name || "Titre pour les moteurs de recherche"}
                    value={formData.metaTitle}
                    onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                    className="mt-1.5"
                    maxLength={60}
                  />
                  <p className="text-xs text-slate-400 mt-1">{formData.metaTitle.length}/60</p>
                </div>

                <div>
                  <Label htmlFor="metaDesc">Description SEO</Label>
                  <Textarea
                    id="metaDesc"
                    placeholder="Description courte pour Google (160 caractères max)"
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    className="mt-1.5 min-h-24"
                    maxLength={160}
                  />
                  <p className="text-xs text-slate-400 mt-1">{formData.metaDescription.length}/160</p>
                </div>

                <div>
                  <Label htmlFor="tags">Mots-clés (séparés par virgules)</Label>
                  <Input
                    id="tags"
                    placeholder="riz, basmati, premium, local, sénégal"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft size={16} className="mr-2" />
            Précédent
          </Button>

          <div className="flex gap-3">
            {currentStep < 4 ? (
              <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                Suivant
              </Button>
            ) : (
              <Button
                onClick={handlePublish}
                className="bg-green-600 hover:bg-green-700 min-w-[160px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader2 size={16} className="mr-2 animate-spin" /> Publication...</>
                ) : (
                  <><CheckCircle2 size={16} className="mr-2" /> Publier le produit</>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
