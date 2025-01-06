/* uint8_vector_stream.hpp
 *
 * contains definitions for a [i/o]stream of an std::vector of bytes
 */

#ifndef UINT8_VECTOR_STREAM_H
#define UINT8_VECTOR_STREAM_H

#include <iostream>
#include <fstream>
#include <streambuf>
#include <vector>

//-------------------------//

class Uint8VectorIStream : public std::basic_istream<char> 
{
private:
	class Uint8VectorStreamBuf : public std::streambuf
	{
	private:
		std::vector<uint8_t>& m_vec;
		char_type* m_begin;
		char_type* m_end;

	public:
		explicit Uint8VectorStreamBuf(std::vector<uint8_t>& vec) :
			m_vec(vec), m_begin(reinterpret_cast<char_type*>(m_vec.data())), m_end(m_begin + m_vec.size())
		{
			setg(m_begin, m_begin, m_end);
		}

		virtual pos_type seekoff(off_type off, std::ios_base::seekdir dir, std::ios_base::openmode which = std::ios_base::in) override
		{
			if(!(which & std::ios_base::in)) 
				return pos_type(-1);

			char_type* newPos;
			switch (dir) 
			{
				case std::ios_base::beg:
					newPos = m_begin + off;
					break;
				case std::ios_base::cur:
					newPos = gptr() + off;
					break;
				case std::ios_base::end:
					newPos = m_end + off;
					break;
				default:
					return pos_type(-1);
			}

			if(newPos < m_begin || newPos > m_end) 
				return pos_type(-1);

			setg(m_begin, newPos, m_end);
			return pos_type(newPos - m_begin);
		}

		virtual pos_type seekpos(pos_type pos, std::ios_base::openmode which = std::ios_base::in) override
		{
			return seekoff(pos, std::ios_base::beg, which);
		}
	};

	Uint8VectorStreamBuf m_streambuf;

public:
	explicit Uint8VectorIStream(std::vector<uint8_t>& vec) :
		std::basic_istream<char>(&m_streambuf), m_streambuf(vec)
	{

	}
};

class Uint8VectorOStream : public std::basic_ostream<char>
{
private:
	class Uint8VectorStreamBuf : public std::streambuf
	{
	private:
		std::vector<uint8_t>& m_vec;

	protected:
		virtual int_type overflow(int_type ch = traits_type::eof()) override 
		{
			if(ch != traits_type::eof())
				m_vec.push_back(static_cast<uint8_t>(ch));

			return ch;
		}

		virtual std::streamsize xsputn(const char* s, std::streamsize n) override 
		{
			size_t old_size = m_vec.size();
			m_vec.resize(old_size + n);
			std::memcpy(m_vec.data() + old_size, s, n);
			return n;
		}

	public:
		explicit Uint8VectorStreamBuf(std::vector<uint8_t>& vec) : 
			m_vec(vec)
		{

		}
	};

	Uint8VectorStreamBuf m_streambuf;

public:
	explicit Uint8VectorOStream(std::vector<uint8_t>& vec)
		: std::basic_ostream<char>(&m_streambuf), m_streambuf(vec)
	{

	}
};

#endif // #ifndef UINT8_VECTOR_STREAM_H