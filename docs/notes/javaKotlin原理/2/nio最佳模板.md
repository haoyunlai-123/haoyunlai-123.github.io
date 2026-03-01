```java
import java.io.IOException;
import java.nio.*;
import java.nio.channels.*;
import java.nio.file.*;
import sun.nio.ch.DirectBuffer;

public class FileIOExample {
    public static void main(String[] args) throws IOException {
        Path path = Path.of("a/b/c/a.txt");
        Files.createDirectories(path.getParent());

        // 写文件（堆外缓冲）
        try (FileChannel fc = FileChannel.open(path,
                StandardOpenOption.WRITE, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING)) {
            ByteBuffer buf = ByteBuffer.allocateDirect(8);
            buf.put("xiaoyage".getBytes());
            buf.flip();
            fc.write(buf);
        }

        // 读文件（mmap）
        try (FileChannel fc = FileChannel.open(path, StandardOpenOption.READ)) {
            MappedByteBuffer map = fc.map(FileChannel.MapMode.READ_ONLY, 0, fc.size());
            while (map.hasRemaining()) {
                System.out.print((char) map.get());
            }

            // 可选：释放 mmap
            ((DirectBuffer) map).cleaner().clean();
        }
    }
}

```