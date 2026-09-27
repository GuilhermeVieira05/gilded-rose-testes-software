import networkx as nx, numpy as np
E=[(1,2),(2,29,'F'),(2,3,'V'),(3,4,'V'),(3,8,'F'),(4,5,'V'),(5,6,'V'),(8,9,'V'),(9,10),(10,11,'V'),(11,12,'V'),(11,14,'F'),
(12,13,'V'),(12,14,'F'),(13,14),(14,15,'V'),(15,16,'V'),(4,17,'F'),(5,17,'F'),(6,17),(8,17,'F'),(10,17,'F'),(14,17,'F'),(15,17,'F'),
(16,17),(17,18,'V'),(17,19,'F'),(18,19),(19,20,'V'),(19,28,'F'),(20,21,'V'),(20,26,'F'),(21,22,'V'),(21,25,'F'),(22,23,'V'),(22,28,'F'),
(23,24,'V'),(23,28,'F'),(24,28),(25,28),(26,27,'V'),(26,28,'F'),(27,28),(28,2)]
G=nx.DiGraph(); [G.add_edge(e[0],e[1]) for e in E]
N,M=G.number_of_nodes(),G.number_of_edges()
dec=[n for n in G if G.out_degree(n)==2]
print('N',N,'E',M,'E-N+2',M-N+2,'decisoes',len(dec),sorted(dec),'P+1',len(dec)+1)
ok,emb=nx.check_planarity(G.to_undirected())
faces=set()
for u,v in emb.edges():
    f=emb.traverse_face(u,v); faces.add(frozenset(zip(f,f[1:]+f[:1])))
print('planar',ok,'regioes',len(faces))
# simulacao espelhando o codigo, registrando nos
AB,BP,SU='Aged Brie','Backstage passes to a TAFKAL80ETC concert','Sulfuras, Hand of Ragnaros'
def run(items):
    p=[1]
    for it in items:
        p+=[2,3]
        n,s,q=it
        if n!=AB and n!=BP:
            p.append(4)
            if q>0:
                p.append(5)
                if n!=SU: q-=1; p.append(6)
        else:
            p.append(8)
            if q<50:
                q+=1; p+=[9,10]
                if n==BP:
                    p.append(11)
                    if s<11:
                        p.append(12)
                        if q<50: q+=1; p.append(13)
                    p.append(14)
                    if s<6:
                        p.append(15)
                        if q<50: q+=1; p.append(16)
        p.append(17)
        if n!=SU: s-=1; p.append(18)
        p.append(19)
        if s<0:
            p.append(20)
            if n!=AB:
                p.append(21)
                if n!=BP:
                    p.append(22)
                    if q>0:
                        p.append(23)
                        if n!=SU: q-=1; p.append(24)
                else: q=0; p.append(25)
            else:
                p.append(26)
                if q<50: q+=1; p.append(27)
        p.append(28)
    p+=[2,29]; return p,(s,q) if items else None
idx={(e[0],e[1]):i for i,e in enumerate(E)}
def vec(p):
    v=np.zeros(M)
    for a,b in zip(p,p[1:]): v[idx[(a,b)]]+=1
    return v
VEST='+5 Dexterity Vest'
BASE=[(VEST,10,20),None,(VEST,10,0),(SU,0,80),(SU,-1,80),(VEST,0,10),(VEST,0,1),(AB,10,20),(AB,10,50),(AB,0,10),(AB,0,49),
(BP,15,20),(BP,10,20),(BP,10,49),(BP,5,20),(BP,5,48),(BP,0,20),(SU,0,0)]
vs=[]
for k,c in enumerate(BASE,1):
    p,out=run([] if c is None else [c]); vs.append(vec(p))
    print(f'C{k:<2}',c,'->',out,'|','-'.join(map(str,p)))
print('rank da base:',np.linalg.matrix_rank(np.array(vs)))
cov={(a,b) for v in vs for (a,b),i in idx.items() if v[i]}
print('arestas nao cobertas:',[e for e in idx if e not in cov])
