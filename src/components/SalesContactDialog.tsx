import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Phone, Mail, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SalesContact {
  id: string;
  region: string;
  contact_name: string | null;
  phone: string;
  email: string;
}

interface SalesContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manufacturerId: string;
  manufacturerName: string;
  userRegion?: string;
}

const SalesContactDialog = ({
  open,
  onOpenChange,
  manufacturerId,
  manufacturerName,
  userRegion = "Gulf Coast"
}: SalesContactDialogProps) => {
  const [contacts, setContacts] = useState<SalesContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && manufacturerId) {
      fetchContacts();
    }
  }, [open, manufacturerId, userRegion]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales_contacts')
        .select('*')
        .eq('manufacturer_id', manufacturerId)
        .eq('region', userRegion);

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching sales contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Contact {manufacturerName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading contact information...
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No sales representative found for your region.
            </div>
          ) : (
            contacts.map((contact) => (
              <div key={contact.id} className="space-y-3 border rounded-lg p-4 bg-card">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{contact.region}</span>
                </div>
                
                {contact.contact_name && (
                  <div className="text-sm font-medium">{contact.contact_name}</div>
                )}

                <a 
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>{contact.phone}</span>
                </a>

                <a 
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3 text-sm hover:text-primary transition-colors break-all"
                >
                  <Mail className="w-4 h-4" />
                  <span>{contact.email}</span>
                </a>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SalesContactDialog;