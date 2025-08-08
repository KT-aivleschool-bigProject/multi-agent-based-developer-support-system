
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Search, Plus, MessageSquare, Eye, Paperclip, Loader2 } from 'lucide-react';
import { postAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Post {
  postId: number;
  title: string;
  content: string;
  userId: number;
  userName?: string;
  createdAt: string;
  viewCount: number;
  commentCount?: number;
}

interface PostListResponse {
  content: Post[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

const Board = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const { user } = useAuth();

  // 게시글 목록 가져오기
  const fetchPosts = async (page: number = 0, keyword?: string) => {
    try {
      setLoading(true);
      const response: PostListResponse = await postAPI.getPostList(page, 10, keyword);
      setPosts(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setCurrentPage(response.number);
    } catch (error) {
      console.error('게시글 목록 조회 실패:', error);
      toast({
        title: "오류",
        description: "게시글 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 검색 처리
  const handleSearch = () => {
    setCurrentPage(0);
    fetchPosts(0, searchTerm);
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPosts(page, searchTerm);
  };

  // 초기 로드
  useEffect(() => {
    fetchPosts();
  }, []);

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;
    
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">문서 게시판</h1>
          <p className="text-muted-foreground">
            프로젝트 문서를 공유하고 협업해보세요. (총 {totalElements}개)
          </p>
        </div>
        <Button asChild className="mt-4 lg:mt-0">
          <Link to="/board/new">
            <Plus className="mr-2 h-4 w-4" />
            문서 작성
          </Link>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 사이드바 */}
        <div className="lg:w-64 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">검색</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="문서 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} className="w-full" size="sm">
                  검색
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 게시글 목록 */}
        <div className="flex-1 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : posts.length > 0 ? (
            <>
              {posts.map((post) => (
                <Card key={post.postId} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <Link to={`/board/${post.postId}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-xs">
                              {post.userName ? post.userName[0].toUpperCase() : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{post.userName || `사용자${post.userId}`}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            <span>{post.viewCount}</span>
                          </div>
                          {post.commentCount !== undefined && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <MessageSquare className="h-3 w-3" />
                              <span>{post.commentCount}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">
                        {post.title || '제목 없음'}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {post.content || '내용 없음'}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              ))}

              {/* 페이징 */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    이전
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(0, Math.min(totalPages - 1, currentPage - 2 + i));
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                  >
                    다음
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  {searchTerm ? '검색 결과가 없습니다.' : '게시글이 없습니다.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Board;
