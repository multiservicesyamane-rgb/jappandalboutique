import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

export default function Contact() {
  const settings = useSettings();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-gradient-to-br from-primary via-primary/95 to-secondary/20 text-primary-foreground py-12">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contactez-nous</h1>
            <p className="text-lg opacity-90 max-w-2xl">
              Commandez directement via WhatsApp ou appelez-nous. Nous sommes à votre disposition !
            </p>
          </div>
        </section>

        <div className="container py-12">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Téléphone</h3>
                      <div className="space-y-2">
                        <a 
                          href={`tel:${settings.phone1}`}
                          className="block text-muted-foreground hover:text-primary transition-colors"
                        >
                          Ligne 1 : {settings.phone1}
                        </a>
                        <a 
                          href={`tel:${settings.phone2}`}
                          className="block text-muted-foreground hover:text-primary transition-colors"
                        >
                          Ligne 2 : {settings.phone2}
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">WhatsApp</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Commandez directement via WhatsApp pour une réponse rapide
                      </p>
                      <div className="space-y-2">
                        <Button 
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                          asChild
                        >
                          <a href={`https://wa.me/${settings.phone1.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            WhatsApp Ligne 1
                          </a>
                        </Button>
                        <Button 
                          variant="outline"
                          className="w-full"
                          asChild
                        >
                          <a href={`https://wa.me/${settings.phone2.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            WhatsApp Ligne 2
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Email</h3>
                      <a 
                        href={`mailto:${settings.email}`}
                        className="text-muted-foreground hover:text-primary transition-colors break-all"
                      >
                        {settings.email}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Adresse</h3>
                      <p className="text-muted-foreground">{settings.address}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Livraison disponible
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hours and Info */}
            <div className="space-y-6">
              <Card className="border-2 border-primary">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-4">Horaires d'ouverture</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium">Lundi — Samedi</p>
                          <p className="text-muted-foreground">8h - 21h</p>
                        </div>
                        <div>
                          <p className="font-medium">Dimanche</p>
                          <p className="text-muted-foreground">9h - 14h</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary via-primary/95 to-secondary/20 text-primary-foreground border-0">
                <CardContent className="pt-6">
                  <h3 className="font-bold text-xl mb-4">Pourquoi nous choisir ?</h3>
                  <ul className="space-y-3">
                    {[
                      { title: "Produits Frais", description: "Des produits locaux et de qualité sélectionnés avec soin" },
                      { title: "Livraison Rapide", description: "Livré chez vous en un temps record" },
                      { title: "Prix Compétitifs", description: "Les meilleurs prix du marché" },
                      { title: "Service Client", description: "Un support disponible 7j/7" },
                    ].map((value, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-accent-foreground text-xs font-bold">✓</span>
                        </div>
                        <div>
                          <p className="font-semibold">{value.title}</p>
                          <p className="text-sm opacity-90 mt-1">{value.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-accent text-accent-foreground border-0">
                <CardContent className="pt-6 text-center">
                  <h3 className="font-bold text-xl mb-2">Prêt à commander ?</h3>
                  <p className="mb-4 opacity-90">
                    Contactez-nous dès maintenant sur WhatsApp
                  </p>
                  <Button 
                    size="lg"
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    asChild
                  >
                    <a href={`https://wa.me/${settings.phone1.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Commander maintenant
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
