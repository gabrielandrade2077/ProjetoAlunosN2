import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Student {
  id: string;
  name: string;
  matricula: string;
  email: string;
  birth_date: string;
}

interface StudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
  onSuccess: () => void;
}

const StudentForm = ({ open, onOpenChange, student, onSuccess }: StudentFormProps) => {
  const [name, setName] = useState('');
  const [matricula, setMatricula] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (student) {
      setName(student.name);
      setMatricula(student.matricula);
      setEmail(student.email);
      setBirthDate(student.birth_date);
    } else {
      setName('');
      setMatricula('');
      setEmail('');
      setBirthDate('');
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);

    try {
      if (student) {
        // Update existing student
        const { error } = await supabase
          .from('students')
          .update({
            name,
            matricula,
            email,
            birth_date: birthDate,
          })
          .eq('id', student.id);

        if (error) throw error;

        toast({
          title: 'Aluno atualizado!',
          description: 'Os dados do aluno foram atualizados com sucesso.',
        });
      } else {
        // Create new student
        const { error } = await supabase
          .from('students')
          .insert({
            user_id: user.id,
            name,
            matricula,
            email,
            birth_date: birthDate,
          });

        if (error) {
          if (error.code === '23505') {
            throw new Error('Matrícula já cadastrada');
          }
          throw error;
        }

        toast({
          title: 'Aluno cadastrado!',
          description: 'O aluno foi adicionado com sucesso.',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao salvar os dados.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{student ? 'Editar Aluno' : 'Adicionar Aluno'}</DialogTitle>
          <DialogDescription>
            {student ? 'Atualize as informações do aluno' : 'Preencha os dados do novo aluno'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="João da Silva"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input
                id="matricula"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="2024001"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joao@email.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentForm;
