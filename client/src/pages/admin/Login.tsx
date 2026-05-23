import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const utils = trpc.useUtils();
  const login = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/admin");
    },
    onError: (err) => {
      toast.error(err.message || "Identifiants incorrects");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    login.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#1E5A8E] flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Jappandal Boutique</h1>
          <p className="text-sm text-gray-500 mt-1">Espace Administrateur</p>
        </div>

        <Card className="shadow-lg border">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-base flex items-center justify-center gap-2 text-gray-700">
              <Lock className="h-4 w-4" />
              Connexion Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@jappandal.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10"
                  autoFocus
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10"
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                disabled={login.isPending}
                className="w-full h-11 bg-[#1E5A8E] hover:bg-[#0D3B0D] text-white font-semibold"
              >
                {login.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          Accès réservé aux administrateurs
        </p>
      </div>
    </div>
  );
}
