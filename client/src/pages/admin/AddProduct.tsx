import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, Upload, Trash2, Plus, Eye } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function AddProduct() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    promoPrice: '',
    unit: 'Pièce',
    badge: 'Nouveau',
    stockQty: '1',
    availability: 'in_stock',
    shortDescription: '',
    descriptionHtml: '',
    sku: '',
    barcode: '',
    metaTitle: '',
    metaDescription: '',
    tags: '',
  });

  const [media, setMedia] = useState<Array<{ url: string; type: 'image' | 'video'; sortOrder: number }>>([]);
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>([]);
  const [newSpec, setNewSpec] = useState({ key: '', value: '' });

  const categories = trpc.categories.list.useQuery();
  const createDraft = trpc.productDrafts.create.useMutation();

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSpec = () => {
    if (newSpec.key && newSpec.value) {
      setSpecs([...specs, newSpec]);
      setNewSpec({ key: '', value: '' });
    }
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleAddMedia = (url: string, type: 'image' | 'video') => {
    if (url && media.length < 5) {
      setMedia([...media, { url, type, sortOrder: media.length }]);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!formData.name || !formData.categoryId || !formData.price) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const result = await createDraft.mutateAsync({
        name: formData.name,
        categoryId: parseInt(formData.categoryId),
      });
      alert('Produit créé avec succès !');
      window.location.href = '/admin/produits';
    } catch (error) {
      alert('Erreur lors de la création du produit');
      console.error(error);
    }
  };

  const steps = [
    { number: 1, title: 'Informations', description: 'Détails principaux' },
    { number: 2, title: 'Médias', description: 'Images & vidéos' },
    { number: 3, title: 'Description', description: 'Contenu riche' },
    { number: 4, title: 'SEO', description: 'Optimisation' },
  ];

  const completionPercentage = Math.round((currentStep / 4) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Ajouter un Produit</h1>
          <p className="text-slate-600">Créez une fiche produit complète et professionnelle</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8 border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Progression</span>
                <span className="text-sm font-bold text-blue-600">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Indicator */}
        <div className="grid grid-cols-4 gap-2 md:gap-4 mb-8">
          {steps.map((step) => (
            <button
              key={step.number}
              onClick={() => setCurrentStep(step.number)}
              className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
                currentStep === step.number
                  ? 'border-blue-500 bg-blue-50'
                  : currentStep > step.number
                  ? 'border-green-500 bg-green-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                    currentStep === step.number
                      ? 'bg-blue-500 text-white'
                      : currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {currentStep > step.number ? <CheckCircle2 size={16} /> : step.number}
                </div>
                <span className="text-xs md:text-sm font-medium text-slate-900">{step.title}</span>
                <span className="text-xs text-slate-500 hidden md:block">{step.description}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Form Content */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Information Principale */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="name">Nom du produit *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Riz Basmati Premium 5kg"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Catégorie *</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.data?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="unit">Unité</Label>
                    <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pièce">Pièce</SelectItem>
                        <SelectItem value="Kg">Kilogramme</SelectItem>
                        <SelectItem value="L">Litre</SelectItem>
                        <SelectItem value="Paquet">Paquet</SelectItem>
                        <SelectItem value="Boîte">Boîte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Prix *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="promoPrice">Prix Promo</Label>
                    <Input
                      id="promoPrice"
                      type="number"
                      placeholder="0.00"
                      value={formData.promoPrice}
                      onChange={(e) => handleInputChange('promoPrice', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="badge">Badge</Label>
                    <Select value={formData.badge} onValueChange={(value) => handleInputChange('badge', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nouveau">Nouveau</SelectItem>
                        <SelectItem value="Promo">Promo</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="Populaire">Populaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="0"
                      value={formData.stockQty}
                      onChange={(e) => handleInputChange('stockQty', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="shortDesc">Description courte</Label>
                  <Textarea
                    id="shortDesc"
                    placeholder="Brève description pour l'affichage en listing"
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    className="mt-2 min-h-20"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Médias */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Minimum 3 images obligatoires</p>
                    <p>Maximum 5 images par produit. Formats: JPG, PNG, WebP</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Upload Images/Vidéos</Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <Upload className="mx-auto mb-2 text-slate-400" size={32} />
                    <p className="text-sm text-slate-600">Cliquez ou glissez-déposez vos fichiers</p>
                    <p className="text-xs text-slate-500 mt-1">Max 10 Mo par fichier</p>
                  </div>
                </div>

                {/* Media Gallery */}
                {media.length > 0 && (
                  <div>
                    <Label>Médias uploadés ({media.length}/5)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                      {media.map((item, idx) => (
                        <div key={idx} className="relative group">
                          <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                            {item.type === 'image' ? (
                              <img src={item.url} alt={`Media ${idx + 1}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-200">
                                <span className="text-xs text-slate-600">Vidéo</span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveMedia(idx)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={16} />
                          </button>
                          {idx === 0 && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              Principal
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Description & Caractéristiques */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="description">Description détaillée</Label>
                  <Textarea
                    id="description"
                    placeholder="Description complète du produit avec détails, avantages, mode d'utilisation..."
                    value={formData.descriptionHtml}
                    onChange={(e) => handleInputChange('descriptionHtml', e.target.value)}
                    className="mt-2 min-h-40 font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">HTML supporté pour formatage avancé</p>
                </div>

                <div className="border-t pt-6">
                  <Label className="text-base font-semibold mb-4 block">Caractéristiques Produit</Label>
                  
                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Ex: Marque"
                        value={newSpec.key}
                        onChange={(e) => setNewSpec({ ...newSpec, key: e.target.value })}
                      />
                      <Input
                        placeholder="Ex: Samsung"
                        value={newSpec.value}
                        onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })}
                      />
                    </div>
                    <Button
                      onClick={handleAddSpec}
                      variant="outline"
                      className="w-full"
                    >
                      <Plus size={16} className="mr-2" />
                      Ajouter Caractéristique
                    </Button>
                  </div>

                  {specs.length > 0 && (
                    <div className="bg-slate-50 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <tbody>
                          {specs.map((spec, idx) => (
                            <tr key={idx} className="border-b last:border-b-0">
                              <td className="px-4 py-3 font-medium text-slate-900">{spec.key}</td>
                              <td className="px-4 py-3 text-slate-600">{spec.value}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => handleRemoveSpec(idx)}
                                  className="text-red-600 hover:text-red-700 text-xs font-medium"
                                >
                                  Supprimer
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: SEO */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                  <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
                  <div className="text-sm text-green-800">
                    <p className="font-medium">Optimisation SEO</p>
                    <p>Remplissez ces champs pour améliorer votre visibilité en recherche</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="sku">SKU / Code Produit</Label>
                  <Input
                    id="sku"
                    placeholder="Ex: PROD-001"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="barcode">Code-barres</Label>
                  <Input
                    id="barcode"
                    placeholder="Ex: 5901234123457"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
                  <Input
                    id="metaTitle"
                    placeholder="Titre pour les moteurs de recherche"
                    value={formData.metaTitle}
                    onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                    className="mt-2"
                    maxLength={60}
                  />
                  <p className="text-xs text-slate-500 mt-1">{formData.metaTitle.length}/60 caractères</p>
                </div>

                <div>
                  <Label htmlFor="metaDesc">Meta Description (SEO)</Label>
                  <Textarea
                    id="metaDesc"
                    placeholder="Description pour les moteurs de recherche"
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    className="mt-2 min-h-20"
                    maxLength={160}
                  />
                  <p className="text-xs text-slate-500 mt-1">{formData.metaDescription.length}/160 caractères</p>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                  <Input
                    id="tags"
                    placeholder="Ex: riz, basmati, premium, bio"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Précédent
          </Button>

          <div className="flex gap-3">
            <Button variant="outline">
              <Eye size={16} className="mr-2" />
              Aperçu
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Suivant
              </Button>
            ) : (
              <Button
                onClick={handlePublish}
                className="bg-green-600 hover:bg-green-700"
                disabled={createDraft.isPending}
              >
                {createDraft.isPending ? 'Publication...' : 'Publier le Produit'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
