import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Hospital, MapPin, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Member {
  id: string;
  nama: string;
  npa: string | null;
  tempat_praktek_1: string | null;
  tempat_praktek_2: string | null;
  tempat_praktek_3: string | null;
  tempat_praktek_1_tipe: string | null;
  tempat_praktek_2_tipe: string | null;
  tempat_praktek_3_tipe: string | null;
  kota_kabupaten_kantor: string | null;
  provinsi_kantor: string | null;
  cabang: string | null;
}

interface TipeRSViewProps {
  filters?: {
    provinsi?: string;
    pd?: string;
    kota?: string;
  };
}

export function TipeRSView({ filters }: TipeRSViewProps) {
  const [selectedTipe, setSelectedTipe] = useState<string>('');
  const [hospitalTypes, setHospitalTypes] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitalTypes();
  }, []);

  useEffect(() => {
    if (selectedTipe) {
      fetchMembersByTipe();
    }
  }, [selectedTipe, filters]);

  const fetchHospitalTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('tempat_praktek_1_tipe, tempat_praktek_2_tipe, tempat_praktek_3_tipe');

      if (error) throw error;

      // Get unique hospital types from all three practice locations
      const types = new Set<string>();
      data?.forEach((member: any) => {
        if (member.tempat_praktek_1_tipe) types.add(member.tempat_praktek_1_tipe);
        if (member.tempat_praktek_2_tipe) types.add(member.tempat_praktek_2_tipe);
        if (member.tempat_praktek_3_tipe) types.add(member.tempat_praktek_3_tipe);
      });

      setHospitalTypes(Array.from(types).sort());
    } catch (error) {
      console.error('Error fetching hospital types:', error);
    }
  };

  const fetchMembersByTipe = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('members')
        .select('id, nama, npa, tempat_praktek_1, tempat_praktek_2, tempat_praktek_3, tempat_praktek_1_tipe, tempat_praktek_2_tipe, tempat_praktek_3_tipe, kota_kabupaten_kantor, provinsi_kantor, cabang')
        .eq('status', 'AKTIF');

      // Apply filters
      if (filters?.provinsi) {
        query = query.eq('provinsi_kantor', filters.provinsi);
      }
      if (filters?.pd) {
        query = query.eq('cabang', filters.pd);
      }
      if (filters?.kota) {
        query = query.eq('kota_kabupaten_kantor', filters.kota);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter members who have the selected hospital type in any of their practice locations
      const filteredMembers = data?.filter((member: any) => 
        member.tempat_praktek_1_tipe === selectedTipe ||
        member.tempat_praktek_2_tipe === selectedTipe ||
        member.tempat_praktek_3_tipe === selectedTipe
      ) || [];

      setMembers(filteredMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMemberPracticeLocations = (member: Member) => {
    const locations = [];
    if (member.tempat_praktek_1_tipe === selectedTipe) {
      locations.push({
        name: member.tempat_praktek_1,
        type: member.tempat_praktek_1_tipe,
        number: 1
      });
    }
    if (member.tempat_praktek_2_tipe === selectedTipe) {
      locations.push({
        name: member.tempat_praktek_2,
        type: member.tempat_praktek_2_tipe,
        number: 2
      });
    }
    if (member.tempat_praktek_3_tipe === selectedTipe) {
      locations.push({
        name: member.tempat_praktek_3,
        type: member.tempat_praktek_3_tipe,
        number: 3
      });
    }
    return locations;
  };

  return (
    <Card className="rounded-2xl border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hospital className="h-5 w-5 text-primary" />
          Filter Berdasarkan Tipe RS
        </CardTitle>
        <CardDescription>
          Lihat daftar anggota yang berpraktik di tipe rumah sakit tertentu
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Hospital Type Selector */}
          <Select value={selectedTipe} onValueChange={setSelectedTipe}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih Tipe Rumah Sakit" />
            </SelectTrigger>
            <SelectContent>
              {hospitalTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Member Count Badge */}
          {selectedTipe && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Total Anggota</span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {members.length} Anggota
              </Badge>
            </div>
          )}

          {/* Members List */}
          {selectedTipe && (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {loading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Hospital className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Tidak ada anggota dengan tipe RS ini</p>
                </div>
              ) : (
                members.map((member) => {
                  const locations = getMemberPracticeLocations(member);
                  return (
                    <div
                      key={member.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-medium">{member.nama}</h4>
                            {member.npa && (
                              <Badge variant="outline" className="text-xs">
                                NPA: {member.npa}
                              </Badge>
                            )}
                          </div>
                          
                          {member.kota_kabupaten_kantor && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                              <MapPin className="h-3 w-3" />
                              <span>{member.kota_kabupaten_kantor}, {member.provinsi_kantor}</span>
                            </div>
                          )}

                          {member.cabang && (
                            <Badge variant="secondary" className="text-xs mb-2">
                              {member.cabang}
                            </Badge>
                          )}

                          {/* Practice Locations */}
                          <div className="space-y-1 mt-2">
                            {locations.map((loc, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="font-medium text-primary">Praktek {loc.number}:</span>{' '}
                                <span className="text-muted-foreground">{loc.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
